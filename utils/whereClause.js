// base - Product.find()

// bigQ - // search=coder&page=2&category=shortsleeves&rating[get]=4&price[lte]=999&price[get]=199
// bigQ is a request query


class WhereClause {
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
    }

    search() {
        const searchword = this.bigQ.search ? {
            name: {
                // regx based search -> anyting that closely comes it will show
                $regex: this.bigQ.search,
                $options: "i"
            }
        } : {}

        this.base = this.base.find({ ...searchword })
        return this;
    }

    filter() {
        const copyQ = { ...this.bigQ }

        delete copyQ["search"]
        delete copyQ["limit"]
        delete copyQ["page"]


        // convert bigQ into a string => copyQ
        let stringOfCopyQ = JSON.stringify(copyQ)

        stringOfCopyQ = stringOfCopyQ.replace(/\b(get|lte |gt |lt)/g, m => `$${m}`)

        let jsonOfCopyQ = JSON.parse(stringOfCopyQ)

        this.base = this.base.find(jsonOfCopyQ)
        return this;
    }


    // for pagination
    pager(resultperPage) {
        let currentPage = 1
        if (this.bigQ.page) {
            currentPage = this.bigQ.page;
        }

        const skipVal = resultperPage * (currentPage - 1)

        this.base.limit(resultperPage).skip(skipVal)

        return this

    }

}


module.exports = WhereClause