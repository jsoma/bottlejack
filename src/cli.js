import arg from "arg";
import fs from "fs";
import YAML from "yaml";
import Handlebars from "handlebars";
import path from "path";
import globby from "globby";
import GDoc from "./sources/gdoc.js";

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--templates": String,
      "--static": String,
      "--data": String,
      "-t": "--templates",
      "-s": "--static",
      "-d": "--data",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    output: args["--output"] || 'docs',
    templates: args["--templates"] || 'templates',
    static: args["--static"] || 'static',
    data: args["--data"] || 'data.yaml',
  };
}

function readConfig(filename) {
  const file = fs.readFileSync(filename, "utf8");
  const data = YAML.parse(file);
  return data;
}

class Page {
  constructor(options, template) {
    this.options = options;
    this.template = template;
  }

  async saveTo(rootPath) {
    let savePath = null;
    if(this.options.slug && this.options.slug.indexOf(".html") != -1) {
      savePath = path.join(rootPath, this.options.slug);
    } else {
      savePath = path.join(rootPath, this.options.slug || "", "index.html");
    }
    if (this.options.type === 'gdoc') {
      const doc = new GDoc(this.options.url)
      await doc.process()
      this.options = {...doc.options, ...this.options}
    }
    const relativePrefix = path.relative(path.dirname(savePath), rootPath);
    const content = this.template({...this.options, relativePrefix: relativePrefix })
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    fs.writeFileSync(savePath, content);
  }
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  const config = readConfig(options["data"]);

  const paths = await globby(options.templates);
  const templates = paths.reduce((memo, current) => {
    const name = path.basename(current, ".hbs");
    memo[name] = Handlebars.compile(fs.readFileSync(current, "utf-8"));
    return memo;
  }, {});

  if (options.static) {
    const statics = await globby(options.static);
    statics.forEach((source) => {
      const target = path.join("docs", path.relative(options.static, source))
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(source, target)
    });
  }

  const hp = new Page(config, templates.home);
  hp.saveTo("docs");

  config.pages.forEach((p) => {
    const page = new Page(p, templates.page);
    page.saveTo("docs");
  });
}
