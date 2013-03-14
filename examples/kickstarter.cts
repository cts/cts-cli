#h2.title a {
  value: title;
}

#updates_nav .count {
  value: updates;
}

#backers_nav span data {
  value: backers;
}

#commends_nav .count {
  value: comments;
}

div[data-pledged] {
  value(@data-pledged): pledged;
  value(@data-percent-raised): percentRaised;
  value(@data-goal): goal;
}







