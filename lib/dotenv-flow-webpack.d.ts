export = DotenvFlow;
declare class DotenvFlow extends DefinePlugin {
    /**
     * @param {object} [options] - initialization options
     * @param {string} [options.node_env=process.env.NODE_ENV] - node environment (development/test/production/etc,.)
     * @param {string} [options.default_node_env] - the default node environment
     * @param {string} [options.path=process.cwd()] - path to `.env*` files directory
     * @param {string} [options.pattern='.env[.node_env][.local]'] - naming
     * @param {BufferEncoding|null} [options.encoding='utf8'] - encoding for reading the `.env*` files
     * @param {boolean} [options.system_vars=false] - set to `true` to load all the predefined `process.env.*` variables
     * @param {boolean} [options.debug=false] - turn on detailed logging to help debug why certain variables are not being set as you expect
     * @param {boolean} [options.silent=false] - suppress all kinds of warnings including ".env*" files' loading errors
     */
    constructor(options?: {
        node_env?: string;
        default_node_env?: string;
        path?: string;
        pattern?: string;
        encoding?: BufferEncoding | null;
        system_vars?: boolean;
        debug?: boolean;
        silent?: boolean;
    });
}
import { DefinePlugin } from "webpack";
