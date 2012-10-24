title {
  value: site.title;
}

table tr:nth-child(3) table tbody {
  repeat-inner: 3,posts;
}

table tr:nth-child(3) table tbody td.title a {
  value: title;
  attr: href,permalink;
}

table tr:nth-child(3) table tbody td.title span.comhead {
  value: domain;
}

