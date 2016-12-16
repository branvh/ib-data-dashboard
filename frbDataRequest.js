const request = require("request");
const fs = require("fs");

/*===issues to investigate========

-fix date so that 2 digit year shows up
-rows by loan type
-label the rows

*/


//===============QUERY VARIABLES================

// //Real Estate Loans: Commercial Real Estate Loans, All Commercial Banks
// //Real Estate Loans: Commercial Real Estate Loans: Secured by Multifamily Properties, All Commercial Banks
// //Commercial and Industrial Loans, All Commercial Banks
// //Real Estate Loans: Residential Real Estate Loans, All Commercial Banks
// let outstandings = ['CREACBM027NBOG', 'SMPACBM027SBOG', 'BUSLOANSNSA', 'RREACBM027NBOG'];

// //Charge-Off Rate on Commercial Real Estate Loans (Excluding Farmland), Booked in Domestic Offices, All Commercial Banks
// //Charge-Off Rate on Commercial and Industrial Loans, All Commercial Banks
// //Charge-Off Rate on Single Family Residential Mortgages, Booked in Domestic Offices, All Commercial Banks
// let chargeOffRates = ['CORCREXFACBN',
//     'CORBLACBN',
//     'CORSFRMACBN'
// ];

let com_re = [
    //commercial real estate loans
    //Billions of U.S. Dollars, Not Seasonally Adjusted, monthly
    'CREACBM027NBOG',
    //Charge-Off Rate on Commercial Real Estate Loans (Excluding Farmland), Booked in Domestic Offices, All Commercial Banks, units = %
    'CORCREXFACBN',
    //Delinquency Rate on Commercial Real Estate Loans (Excluding Farmland), Booked in Domestic Offices, All Commercial Banks
    //Percent, not seasonally Adjusted, quarterly
    'DRCRELEXFACBN'
];

let com_ind = [
    //Commercial and Industrial Loans, All Commercial Banks
    //Billions of U.S. Dollars, Not Seasonally Adjusted, monthly
    'BUSLOANSNSA',
    // Charge-Off Rate on Commercial and Industrial Loans, All Commercial Banks
    //Percent, Not Seasonally Adjusted, quarterly
    'CORBLACBN',
    //Delinquency Rate on Commercial and Industrial Loans, All Commercial Banks  
    //Percent, not seasonally Adjusted, quarterly
    'DRBLACBN'
];

let res_re = [
    //Real Estate Loans: Residential Real Estate Loans, All Commercial Banks
    //Billions of U.S. Dollars, Not Seasonally Adjusted, monthly
    'RREACBM027NBOG',
    //Charge-Off Rate on Single Family Residential Mortgages, Booked in Domestic Offices, All Commercial Banks
    //Percent, Not Seasonally Adjusted, quarterly
    'CORSFRMACBN',
    //Delinquency Rate on Single-Family Residential Mortgages, Booked in Domestic Offices, All Commercial Banks
    //Percent, not seasonally Adjusted, quarterly
    'DRSFRMACBN'

];

let credit_card = [
    //Consumer Loans: Credit Cards and Other Revolving Plans, All Commercial Banks
    //Billions of U.S. Dollars, Not Seasonally Adjusted, Monthly
    'CCLACBM027NBOG',
    //Charge-Off Rate on Credit Card Loans, All Commercial Banks
    //Percent, Not Seasonally Adjusted, quarterly
    'CORCCACBN',
    // Delinquency Rate on Credit Card Loans, All Commercial Banks
    //Percent, not seasonally Adjusted, quarterly
    'DRCCLACBN'

];

let rates = [
    //30-Year Fixed Rate Mortgage Average in the United States
    //Percent,Not Seasonally Adjusted, weekly
    'MORTGAGE30US',
    //3-Month London Interbank Offered Rate (LIBOR), based on U.S. Dollar
    //Percent,Not Seasonally Adjusted, daily
    'USD3MTD156N',
    //Bank Prime Loan Rate, Percent, Not Seasonally Adjusted, monthly
    'MPRIME',
    //10-Year Treasury Constant Maturity Minus 3-Month Treasury Constant Maturity
    //Percent, Not Seasonally Adjusted, daily
    'T10Y3M',
    //TED Spread, Percent, Not Seasonally Adjusted, daily
    'TEDRATE',
    //BofA Merrill Lynch US High Yield BB Option-Adjusted Spread
    //Percent, Not Seasonally Adjusted, daily
    'BAMLH0A1HYBB'
];


let start = '2010-01-01';
// let today = new Date();
// let end = today.toISOString().substring(0, 10); //returns a string in simplified extended ISO format (ISO 8601), which is always 24 or 27 characters long (YYYY-MM-DDTHH:mm:ss.sssZ or ±YYYYYY-MM-DDTHH:mm:ss.sssZ, 
let end = '2016-12-01';
//base url for search query to FRB site
let baseURL = 'https://api.stlouisfed.org/fred/series/observations';

//==========QUERY ENABLING FUNCTIONS========================================================

//creates a request object that will feed the generate query string function
const generateResquestObject = (dataType) => {

    return {
        series_id: dataType,
        observation_start: start,
        observation_end: end,
        frequency: 'q',
        api_key: '1d028bd9d2d55b6f9f3ff03820148dfb',
        file_type: 'json'
    };

}

//creates a querystring to send to the FRB api
const genQueryString = (requestObject) => {

    let searchQuery = (baseURL + '?');

    searchQuery += Object.keys(requestObject).map((objCur, objInd) => {

        return objCur + '=' + requestObject[objCur];

    }).join('&');

    return searchQuery;

}

//create a promise tha will be exported and upon 'then' socket will emit data object to the client
const getData = (url) => {

    return new Promise((resolve, reject) => {

        let match = url.match(/\w+(?=&observation_start)/gi);

        let descriptors = series_name(match[0]);
        let srs = descriptors[0];
        let type = descriptors[1];

        //user the request library to get data
        request(url, (error, response, body) => {

            if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
                //parse data into object and grab the data observations component
                let data = JSON.parse(body);
                let dataSet = data.observations;

                //return bunch of x/y objects for future graphing, time-series analysis, etc.
                let transformedData = dataSet.map((cur, ind) => {
                    return { data_series: srs, data_type: type, day: new Date(cur.date).getTime(), val: parseFloat(cur.value) };
                }).filter(itm => !isNaN(itm.val));
                //resolve transformed data and pass back this new data object

                resolve(transformedData);
            } else if (error) {
                reject('Error: ' + error);
            }
            // else {
            //     reject('Error encountered: html status code of ' + response.statusCode + ' received');
            // }

        })

    });

}

const series_name = (srs) => {

    let series = '';
    let type = '';
    switch (srs) {
        case 'CREACBM027NBOG':
            series = 'Commercial Real Estate';
            type = 'Outstandings USD BN'
            break;
        case 'CORCREXFACBN':
            series = 'Commercial Real Estate';
            type = 'Charge Off Rate';
            break;
        case 'DRCRELEXFACBN':
            series = 'Commercial Real Estate';
            type = 'Delinquency Rate';
            break;
        case 'BUSLOANSNSA':
            series = 'C&I Loans';
            type = 'Outstandings USD BN'
            break;
        case 'CORBLACBN':
            series = 'C&I Loans';
            type = 'Charge Off Rate';
            break;
        case 'DRBLACBN':
            series = 'C&I Loans';
            type = 'Delinquency Rate';
            break;
        case 'RREACBM027NBOG':
            series = 'Mortgage';
            type = 'Outstandings USD BN'
            break;
        case 'CORSFRMACBN':
            series = 'Mortgage';
            type = 'Charge Off Rate';
            break;
        case 'DRSFRMACBN':
            series = 'Mortgage';
            type = 'Delinquency Rate';
            break;
        case 'CCLACBM027NBOG':
            series = 'Credit Card';
            type = 'Outstandings USD BN'
            break;
        case 'CORCCACBN':
            series = 'Credit Card';
            type = 'Charge Off Rate';
            break;
        case 'DRCCLACBN':
            series = 'Credit Card';
            type = 'Delinquency Rate';
            break;
        case 'MORTGAGE30US':
            series = 'Interest Rate';
            type = 'Thirty Year Fixed';
            break;
        case 'MPRIME':
            series = 'Interest Rate';
            type = 'Prime Rate';
            break;
        case 'USD3MTD156N':
            series = 'Interest Rate';
            type = '3mo USD Libor';
            break;
        case 'T10Y3M':
            series = 'Rate Spread';
            type = 'Ten Yr - 3 mo';
            break;
        case 'TEDRATE':
            series = 'Rate Spread';
            type = 'TED Spread';
            break;
        case 'BAMLH0A1HYBB':
            series = 'Rate Spread';
            type = 'BB Bond OAS';
        default:
            break;
    }

    return [series, type];
}

const generateData = (dataRequest) => {
    //create arrayof parameters for FRB search
    let paramsArr = dataRequest.map(generateResquestObject);
    //create an array of search query strings for frb
    let searchQueryArr = paramsArr.map(genQueryString);
    //create promises which execute query request to fr
    return Promise.all(
        //create a series of promises by mapping through the getData function
        searchQueryArr.map(getData));
}

//=========================DATA EXPORTS==========================================================================================

//a promise will be expored and combined with 'then' (in location to which it is imported) to trgger transmission to client via socket.io.emit 
let exp = module.exports = {};

exp.cre = generateData(com_re);
exp.ci = generateData(com_ind);
exp.mortgage = generateData(res_re);
exp.card = generateData(credit_card);
exp.rates = generateData(rates);


//========================END=====================================================================================================

/* ====Periodically use this to test FRB data output running a single mode via Node=======
generateData(rates).then((responseArr) => {
    responseArr.forEach((item) => {
        console.log('this has ' + item.length + ' elements');
        console.log('===============');
        console.log(item);
    });
}).catch((err) => {
    console.log('Error: ' + err);
});
*/
