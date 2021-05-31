import arg from "arg";
import fs from "fs";
import YAML from "yaml";
import Handlebars from "handlebars";
import path from "path";
import globby from "globby";
import Pino from "pino";
import Page from "./page.js";
import { version } from "../package.json";

const logger = Pino({
  prettyPrint: {
    singleLine: true,
    ignore: "pid,hostname",
  },
});

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--templates": String,
      "--static": String,
      "--data": String,
      "--debug": Boolean,
      "--version": Boolean,
      "-t": "--templates",
      "-s": "--static",
      "-d": "--data",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    output: args["--output"] || "docs",
    templates: args["--templates"] || "templates",
    static: args["--static"] || "static",
    data: args["--data"] || "data.yaml",
    debug: args["--debug"] || false,
    version: args["--version"] || false,
  };
}

function readConfig(filename) {
  const file = fs.readFileSync(filename, "utf8");
  const data = YAML.parse(file);
  return data;
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  if (options.version) {
    console.log(version);
    return;
  }

  logger.info(`Starting our run in ${process.cwd()}`);

  if (options.debug) {
    logger.level = "debug";
  }
  logger.debug({ msg: "Invoking with command-line options", ...options });

  const config = readConfig(options["data"]);
  logger.debug({ msg: "Config read from yaml", ...config });

  logger.info(`Pulling templates from ${options.templates}`);
  const paths = await globby(options.templates);
  logger.debug({ msg: `Found ${paths.length} files`, files: paths });

  const templates = paths.reduce((memo, current) => {
    const name = path.basename(
      path.relative(options.templates, current),
      ".hbs"
    );
    logger.debug(`Compiling template ${name} from ${current}`);
    memo[name] = Handlebars.compile(fs.readFileSync(current, "utf-8"));
    return memo;
  }, {});

  if (options.static) {
    logger.info(`Moving static content from ${options.static}`);
    const statics = await globby(options.static);
    logger.debug({ msg: `Found ${statics.length} files`, files: statics });
    statics.forEach((source) => {
      const target = path.join("docs", path.relative(options.static, source));
      fs.mkdirSync(path.dirname(target), { recursive: true });

      logger.debug({ msg: "Copying", source, target });
      fs.copyFileSync(source, target);
    });
  } else {
    logger.info(`No static folder specified`);
  }

  logger.info("Compiling homepage");
  const hp = new Page(config, templates.home, logger);
  hp.saveTo("docs");

  config.pages.forEach((p, i) => {
    let template = templates[p.template ? p.template : p.type];
    const page = new Page(p, template, logger.child({index: i}));
    page.saveTo("docs");
  });
}
