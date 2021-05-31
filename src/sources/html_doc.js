import fs from "fs";

export default class HtmlDoc {
  constructor(filepath, logger) {
    this.filepath = filepath;
    this.options = {};
    this.logger = logger.child({ filepath });
  }

  async process() {
    this.logger.info(`Processing`);
    this.options.html_content = fs.readFileSync(this.filepath, "utf-8");
  }
}
