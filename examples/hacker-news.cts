table tr:nth-child(3) table {
  repeat: links;
  repeat-step: 3;
  repeat-suffix: 1;
}

table tr:nth-child(3) table td.title a {
  value: title;
  value(@href): link;
}

table tr:nth-child(3) table td.title span.comhead {
  value: domain;
}

table tr:nth-child(3) table td.subtext span {
  value: score;
}

table tr:nth-child(3) table td.subtext a:nth-child(2) {
  value: author.handle;
  value(@href): author.link;
}

