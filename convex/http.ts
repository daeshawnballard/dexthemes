import { httpRouter } from "convex/server";

import { registerAuthRoutes } from "./http_auth_routes";
import { registerThemeRoutes } from "./http_theme_routes";
import { registerUnlockRoutes } from "./http_unlock_routes";
import { registerColorMeLuckyRoutes } from "./http_color_me_lucky_routes";
import { registerPluginRoutes } from "./http_plugin_routes";

const http = httpRouter();

registerAuthRoutes(http);
registerThemeRoutes(http);
registerUnlockRoutes(http);
registerColorMeLuckyRoutes(http);
registerPluginRoutes(http);

export default http;
