  $(document).ready(function() {

      let socket = io.connect();

      socket.on('new instance', (data) => {
          console.log(data);
      });

      socket.on('commercial real estate data', (data) => {
          makeChart(data);
      });
      socket.on('commercial and industrial loan data', (data) => {
          makeChart(data);
      });
      socket.on('mortgage data', (data) => {
          makeChart(data);
      });
      socket.on('card data', (data) => {
          makeChart(data);
      });
      socket.on('rate data', (data) => {
          makeChart(data);
      })

      //enable expandable/collapsable chart sections
      $('.panel-header').on('click', function() {

          $(this).siblings('.panel-body').toggle(500);

      });

      $("#clickme").click(function() {
          $("#book").animate({
              opacity: 0.25,
              left: "+=50",
              height: "toggle"
          }, 5000, function() {
              // Animation complete.
          });
      });

      $('canvas').on('click', function() {

            $(this).css('background-color','red');
            $('.panel-header').css('background-color','red');
          // let copy = $(this);
          // let modal = $('<div>');
          // let closeButton = $('<span>');

          // modal.addClass('modal');
          // copy.addClass('modal-content');
          // closeButton.addClass('close');

          // $('body').append(modal);
          // modal.append(copy);
          // copy.append(closeButton);
          // closeButton.html('&times;');
          // ('.modal').show();

      });

  });

  function makeChart(data) {

      let dataSeries = data[0]['data_series'];
      let dataType = data[0]['data_type'];

      let dataObject = data.map((cur, ind) => {

          let date = new Date(data[ind]['day'])
          let year = date.toISOString().substring(2, 4);
          let month = date.getMonth() + 1; //+1 since months returned as 0-11

          return {
              day: month + '/' + year,
              val: parseFloat(data[ind]['val'])
          };

      });

      let dates = dataObject.map((cur, ind) => {
          return dataObject[ind]['day']
      });
      let values = dataObject.map((cur, ind) => {
          return dataObject[ind]['val']
      });

      createLineChart(dates, values, dataSeries, dataType);
  }

  function createLineChart(dates, values, title, subtitle) {

      let target; //for appending
      let cls;

      //determine DIV to which item will be appended and class to add
      switch (title) {
          case 'Commercial Real Estate':
              target = $('#cre-container');
              cls = 'loan-canvas';
              break;
          case 'C&I Loans':
              target = $('#cni-container');
              cls = 'loan-canvas';
              break;
          case 'Mortgage':
              target = $('#mortgage-container');
              cls = 'loan-canvas';
              break;
          case 'Credit Card':
              target = $('#card-container');
              cls = 'loan-canvas';
              break;
          case 'Interest Rate':
              target = $('#rate-container');
              cls = 'rate-canvas';
              break;
          case 'Rate Spread':
              target = $('#spread-container');
              cls = 'rate-canvas';
              break;
      }

      let newEle = $('<canvas>');
      newEle.addClass('loan-canvas');
      newEle.attr('id', title + subtitle);
      /*
                            case 'MORTGAGE30US':
                  series = 'Interest Rate';
                  type = 'Thirty Year Fixed';
                  break;
              case 'MPRIME':
                  series = 'Interest Rate';
                  type = 'Prime Rate';
              case 'T10Y3M':
                  series = 'Rate Spread';
                  type = 'Ten Yr - 3 mo';
              case 'TEDRATE':
                  series = 'Rate Spread';
                  type = 'TED Spread';
              case 'BAMLH0A1HYBB':
                  series = 'Rate Spread';
                  type = 'BB Bond OAS';
      */
      target.append(newEle);

      var ctx = document.getElementById(title + subtitle);

      Chart.defaults.global.maintainAspectRatio = false;
      // Chart.defaults.global.fullWidth = true;
      Chart.defaults.global.responsive = false;

      var data = {
          labels: dates,
          datasets: [{
              label: subtitle,
              fill: false,
              lineTension: 0.1,
              backgroundColor: "rgba(255, 255, 255,0.4)",
              borderColor: "rgba(75,192,192,1)",
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBorderColor: "rgba(75,192,192,1)",
              pointBackgroundColor: "#fff",
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgba(75,192,192,1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: values,
              spanGaps: false,
          }]
      };

      var myLineChart = new Chart(ctx, {
          type: 'line',
          data: data,

      });
  }


  //update header in IR section

  //create IR type list

  //capture IR type in the DOM canvas as ID

  //create buttons for monthly (limit start date to 2 years ago)

  //weekly (limit to 24 abs ago) button - request weekly data via socket.emit('weekly request')

  //daily (limit to 24 obs ago)  - 'daily request' 

  //upon receiving one of these rate requests, use module.exports + then to send back to the DOM

  //empty out all of the IR DOM elements containers prior to creating the new charts
