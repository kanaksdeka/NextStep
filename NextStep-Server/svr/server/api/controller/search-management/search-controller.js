let path = require('path');
let appRoot = path.join(require('app-root-dir').get(), '/server/');
const Elastic = require(path.join(appRoot, 'api/models/Elastic'));
let mapError = require(path.join(appRoot, 'utils/codeToErrorMapping.js'));

exports.search = function (req, res) {
    const logger = getLogger('es-search-logger');
    let requestId = req.id;
    let body = {
        size: 20,
        from: 0,
        query: {
            multi_match: { //this search will try to search the string in the content field
                "query": req.query.searchfor,
                "type":       "best_fields",
                "operator":   "and",
                "fields":     ["content"],
                "fuzziness": 'AUTO'
            }
        }
    };
    logger.debug("Search query is -"+req.query.searchfor);
    logger.debug(`retrieving documents whose title or authors match '${body.query.multi_match.query}' (displaying ${body.size} items at a time)...`);
    let searcharr=[];
    esclient.search({ index: 'truleap_docs', body: body })
        .then(results => {
            searcharr.push({
                count:results.hits.total.value
            })
            logger.debug(`Results -`,results);
            logger.debug(`found ${results.hits.total.value} items in ${results.took}ms`);
            if (results.hits.total > 0) console.log(`returned article titles:`);
            results.hits.hits.forEach((hit, index) => {
                //logger.debug(`Hit is  -`,hit);
                logger.debug(`\t${body.from + ++index} - ${hit._source.file.filename} (score: ${hit._score})`)
                let doc={};
                    doc.file=hit._source.file.filename!=='undefined' && hit._source.file.filename.length>0?hit._source.file.filename:"";
                    doc.content=hit._source.content;
                    doc.url=hit._source.file.url!=='undefined' && hit._source.file.url.length>0?hit._source.file.url:"";
                searcharr.push(doc)
            });
            res.send(searcharr)
        })
        .catch(err => {
            logger.debug("Error -"+err)
            res.send([]);
        });
};



exports.searchDocumentsForPeriod = function (req, res) {
    var requestId = req.id;
    const logger = getLogger('searchDocumentsForPeriod');
    try {
        var queryPayload = {};
        queryPayload["$and"] = [];
        queryPayload["$and"].push({ indexPeriod: req.body.mainclassid});
        queryPayload["$and"].push({ filename: { $regex: req.body.searchstring,$options: 'i' } });

        logger.error("requestId :: " + requestId + ":: Document search query is  - " ,JSON.stringify(queryPayload));


        Elastic.find(queryPayload, { _id: 1, filename: 1, awsurl: 1, createdAt: 1}, (err, searchdoc) => {
            if (searchdoc.length > 0) {
                logger.error("requestId :: " + requestId + ":: Document  search found with provided input - " + JSON.stringify(searchdoc));
                res.send(searchdoc)
            } else if (err) {
                logger.error("requestId :: " + requestId + ":: Document  search search encountered error  - " + JSON.stringify(err));
                res.send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
            } else {
                logger.error("requestId :: " + requestId + ":: Document  search search No data found");
                res.send(mapError.errorCodeToDesc(requestId, '504', "metadata"))
            }
        })
    } catch (err) {
        logger.error("requestId :: " + requestId + " :: createsearchdoc Exception -" + err);
        res.status(500).send(mapError.errorCodeToDesc(requestId, '502', "metadata"))
    }
};