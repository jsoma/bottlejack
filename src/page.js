import fs from "fs";
import path from "path";
import GDoc from "./sources/gdoc.js";
import HtmlDoc from "./sources/html_doc.js";

export default class Page {
    constructor(options, template, logger) {
      this.logger = logger;
      this.options = options;
      this.template = template;
      this.logger = this.logger.child({type: this.options.type})
      this.logger.debug({ msg: "Building page from", options })
    }
  
    async saveTo(rootPath) {
      if (this.options.type === "raw") {
        this.options = this.options;
        this.logger.info({msg: "Raw, not saving", options: this.options})
        return;
      }
      let savePath = null;
      if (this.options.slug && this.options.slug.indexOf(".html") != -1) {
        savePath = path.join(rootPath, this.options.slug);
      } else {
        savePath = path.join(rootPath, this.options.slug || "", "index.html");
      }
      // Raw is just the YAML options, good for links
      // GDoc populates from an ArchieML-formatted Google Doc
      if (this.options.type === "gdoc") {
        const doc = new GDoc(this.options.url, this.logger);
        await doc.process();
        this.options = { ...doc.options, ...this.options };
      }
      // HTML pulls in a raw HTML doc and puts it into a template
      if (this.options.type === "html") {
        const doc = new HtmlDoc(this.options.filepath, this.logger);
        await doc.process();
        this.options = { ...doc.options, ...this.options };
      }
      const relativePrefix = path.relative(path.dirname(savePath), rootPath);
      const content = this.template({
        ...this.options,
        relativePrefix: relativePrefix,
      });
      fs.mkdirSync(path.dirname(savePath), { recursive: true });

      this.logger.info({msg:"Saving file", savePath})
      fs.writeFileSync(savePath, content);
    }
  }