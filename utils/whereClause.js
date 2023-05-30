// base - Product.find()

// bigQ - // search=coder&page=2&category=shortsleeves&rating[get]=4&price[lte]=999&price[get]=199
// bigQ is a request query

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  // Search functionality
  search() {
    // in bigQ find search keyword and find the value of search
    const searchWord = this.bigQ.search
      ? {
          // if search keyword exists in bigQ then extarct that value
          name: {
            $regex: this.bigQ.search, // looking for similar names
            $options: "i", // i for case insentetivity
          },
        }
      : {};

    this.base = this.base.find({ ...searchWord });
    return this;
  }

  // filtering
  filter() {
    const copyQ = { ...this.bigQ };

    delete copyQ["search"];
    delete copyQ["select"];
    delete copyQ["page"];

    // convert bigQ into string => copyQ
    let stringOfCopyQ = JSON.stringify(copyQ);

    stringOfCopyQ = stringOfCopyQ.replace(
      /\b(get|lte|gt|lt)\b/g,
      (m) => `$${m}`
    );

    // convert to json
    const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

    this.base = this.base.find(jsonOfCopyQ);
  }

  // for pagination
  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }
    const skipVal = resultPerPage * (currentPage - 1);
    this.base = this.base.limit(resultPerPage).skip(skipVal);
    return this;
  }
}

module.exports = WhereClause;
