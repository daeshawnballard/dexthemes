#!/usr/bin/env python3
"""Atomically publish a private host-export stage through bound directory FDs.

The Node builder verifies bytes before invoking this helper.  This program owns
only the activation: it opens each validated directory without following
links, keeps the parent descriptors open while waiting for activation, then
uses renameat-style operations.  There is intentionally no pathname fallback.
"""

import json
import os
import stat
import sys


class PublishError(Exception):
    pass


def emit(payload):
    sys.stdout.write(json.dumps(payload, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def require_features():
    required_flags = ("O_DIRECTORY", "O_NOFOLLOW")
    missing = [name for name in required_flags if not hasattr(os, name)]
    if os.rename not in os.supports_dir_fd:
        missing.append("rename(dir_fd)")
    if os.stat not in os.supports_follow_symlinks:
        missing.append("stat(follow_symlinks=False)")
    if missing:
        raise PublishError("secure descriptor-relative publication is unavailable: " + ", ".join(missing))


def require_object(value, label):
    if not isinstance(value, dict):
        raise PublishError(label + " must be a JSON object")
    return value


def relative_parts(value, label):
    if not isinstance(value, str) or not value or os.path.isabs(value):
        raise PublishError(label + " must be a non-empty relative path")
    if os.altsep and os.altsep in value:
        raise PublishError(label + " uses an unsupported path separator")
    parts = value.split(os.sep)
    if any(part in ("", ".", "..") for part in parts):
        raise PublishError(label + " contains an unsafe path segment")
    return parts


def entry_name(value, label):
    if not isinstance(value, str) or value in ("", ".", "..") or os.sep in value:
        raise PublishError(label + " must be one safe directory entry name")
    if os.altsep and os.altsep in value:
        raise PublishError(label + " uses an unsupported path separator")
    return value


def lstat_at(parent_fd, name):
    try:
        return os.stat(name, dir_fd=parent_fd, follow_symlinks=False)
    except FileNotFoundError:
        return None


def require_directory(info, label):
    if info is None or not stat.S_ISDIR(info.st_mode) or stat.S_ISLNK(info.st_mode):
        raise PublishError(label + " must be a non-symlink directory")


def open_directory(parent_fd, name, label):
    require_directory(lstat_at(parent_fd, name), label)
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
    try:
        descriptor = os.open(name, flags, dir_fd=parent_fd)
    except OSError as error:
        raise PublishError(label + " could not be safely opened: " + str(error)) from error
    try:
        require_directory(os.fstat(descriptor), label)
        return descriptor
    except Exception:
        os.close(descriptor)
        raise


def open_directory_chain(root_fd, parts, label):
    current_fd = os.dup(root_fd)
    try:
        for part in parts:
            next_fd = open_directory(current_fd, part, label + "/" + part)
            os.close(current_fd)
            current_fd = next_fd
        return current_fd
    except Exception:
        os.close(current_fd)
        raise


def validate_slots(stage_parent_fd, target_parent_fd, stage_name, target_name, backup_name):
    require_directory(lstat_at(stage_parent_fd, stage_name), "staged export")
    target = lstat_at(target_parent_fd, target_name)
    if target is not None:
        require_directory(target, "existing host export")
    if backup_name is None:
        if target is not None:
            raise PublishError("existing host export requires a backup slot")
    elif lstat_at(stage_parent_fd, backup_name) is not None:
        raise PublishError("host export backup slot is occupied")
    return target is not None


def read_line(label):
    line = sys.stdin.readline()
    if not line:
        raise PublishError("missing " + label)
    try:
        return require_object(json.loads(line), label)
    except json.JSONDecodeError as error:
        raise PublishError(label + " is not valid JSON") from error


def publish(request):
    allowed = {"repositoryRoot", "stageParent", "stageName", "targetParent", "targetName", "backupName"}
    if set(request) != allowed:
        raise PublishError("publication request has an unexpected shape")
    repository_root = request["repositoryRoot"]
    if not isinstance(repository_root, str) or not os.path.isabs(repository_root):
        raise PublishError("repositoryRoot must be an absolute path")
    stage_parent_parts = relative_parts(request["stageParent"], "stageParent")
    target_parent_parts = relative_parts(request["targetParent"], "targetParent")
    stage_name = entry_name(request["stageName"], "stageName")
    target_name = entry_name(request["targetName"], "targetName")
    backup_name = request["backupName"]
    if backup_name is not None:
        backup_name = entry_name(backup_name, "backupName")
    if backup_name == stage_name:
        raise PublishError("backupName must differ from stageName")

    root_fd = None
    stage_parent_fd = None
    target_parent_fd = None
    moved_existing = False
    try:
        require_features()
        root_info = os.stat(repository_root, follow_symlinks=False)
        require_directory(root_info, "repositoryRoot")
        root_fd = os.open(repository_root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        require_directory(os.fstat(root_fd), "repositoryRoot")
        stage_parent_fd = open_directory_chain(root_fd, stage_parent_parts, "stageParent")
        target_parent_fd = open_directory_chain(root_fd, target_parent_parts, "targetParent")
        has_existing = validate_slots(
            stage_parent_fd, target_parent_fd, stage_name, target_name, backup_name,
        )
        emit({"state": "bound"})

        activation = read_line("activation request")
        if set(activation) != {"command", "testFailAfterBackup"} or activation["command"] != "activate":
            raise PublishError("activation request has an unexpected shape")
        if not isinstance(activation["testFailAfterBackup"], bool):
            raise PublishError("testFailAfterBackup must be boolean")
        if activation["testFailAfterBackup"] and os.environ.get("DEXTHEMES_HOST_EXPORT_TEST_HOOKS") != "1":
            raise PublishError("test-only activation fault is unavailable")

        if has_existing:
            os.rename(target_name, backup_name, src_dir_fd=target_parent_fd, dst_dir_fd=stage_parent_fd)
            moved_existing = True
        if activation["testFailAfterBackup"]:
            raise PublishError("intentional activation failure after descriptor-bound backup")
        os.rename(stage_name, target_name, src_dir_fd=stage_parent_fd, dst_dir_fd=target_parent_fd)
        emit({"state": "published"})
    except Exception as error:
        rollback_error = None
        if moved_existing:
            try:
                if lstat_at(target_parent_fd, target_name) is None:
                    os.rename(backup_name, target_name, src_dir_fd=stage_parent_fd, dst_dir_fd=target_parent_fd)
                    moved_existing = False
            except Exception as rollback_failure:  # preserve the original error while reporting rollback proof.
                rollback_error = str(rollback_failure)
        payload = {"state": "error", "message": str(error), "rolledBack": not moved_existing}
        if rollback_error is not None:
            payload["rollbackError"] = rollback_error
        emit(payload)
        return 1
    finally:
        for descriptor in (target_parent_fd, stage_parent_fd, root_fd):
            if descriptor is not None:
                os.close(descriptor)
    return 0


def main():
    try:
        request = read_line("publication request")
        return publish(request)
    except Exception as error:
        emit({"state": "error", "message": str(error), "rolledBack": False})
        return 1


if __name__ == "__main__":
    sys.exit(main())
