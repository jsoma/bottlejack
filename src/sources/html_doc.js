import fs from "fs";

export default class HtmlDoc {
    constructor(filepath) {
      this.filepath = filepath;
      this.options = {}
    }
  
    async process() {
      console.log("Processing raw HTML from", this.filepath);
      this.options.html_content = fs.readFileSync(this.filepath, 'utf-8')
    }
}