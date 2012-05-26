#siteTable {
  repeat-inner: 2,links;
}

#siteTable div.thing p.title a.title {
  value:title;
  attr:href,link;
}

#siteTable div.thing p.title span.domain a {
  value:domain;
}

#siteTable div.unvoted div.score.unvoted {
  value:score;
}

#siteTable div.unvoted div.score.dislikes {
  value:downvotes;
}

#siteTable div.unvoted div.score.likes {
  value:upvotes;
}

#siteTable div.thing p.tagline time {
  attr:datetime,datetime;
  value:relativeTime;
}

#siteTable div.thing p.tagline a.author {
  attr:href,author.link;
  value:author.handle;
}

#siteTable div.thing p.tagline a.subreddit {
  attr:href,category.link;
  value:category.name;
}

#siteTable div.thing ul.buttons li.first a.comments {
  attr:href,permalink;
  value:commentCount;
}


