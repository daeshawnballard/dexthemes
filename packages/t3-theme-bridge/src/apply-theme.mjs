import { applyT3Theme } from './t3-theme-apply.mjs';

const args = process.argv.slice(2);
const options = {};
try {
  for (let i = 0; i < args.length; i += 2) {
    if (!['--input', '--sha256'].includes(args[i]) || !args[i + 1] || options[args[i]]) throw new Error('Invalid arguments.');
    options[args[i]] = args[i + 1];
  }
  if (!options['--input'] || !options['--sha256']) throw new Error('Usage: node apply-theme.mjs --input THEME.json --sha256 EXACT_SHA256');
  const receipt = await applyT3Theme({ inputPath: options['--input'], expectedSha256: options['--sha256'] });
  console.log(JSON.stringify(receipt));
  if (!receipt.receiptConsistent) process.exitCode = 1;
} catch (error) {
  console.error(JSON.stringify({ error: error.code || 'APPLY_FAILED', message: error.message }));
  process.exitCode = 1;
}
