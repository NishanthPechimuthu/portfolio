const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    const response = await axios.post("https://texlive.net/cgi-bin/latexcgi", {
      "filecontents[]": "\\documentclass{article}\\begin{document}Hello world\\end{document}",
      "filename[]": "document.tex",
      engine: "pdflatex",
      return: "pdf"
    }, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "stream"
    });
    response.data.pipe(fs.createWriteStream("out.pdf"));
    console.log("Success", response.status);
  } catch(e) {
    console.error("Error", e.message);
  }
}
test();
