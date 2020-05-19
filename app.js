const express = require('express');
const fs = require('fs');

// app adında ve express'in tüm özelliklerine sahip bir değişken tanımladık
const app = express();

//middleware. request ile response arasında birşeyler yapılacak
app.use(express.json());

// //get is a http method
// app.get('/', (req, res) => {
//   //res.status(200).send('Hello from the server side!');
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success', //success, fail, error
    results: tours.length, //json standardında bu alan genelde olmaz ama client tarafında işe yarayabilir diye yollanıyor
    data: {
      //tours: tours, //ES6'de aynı isimlileri yazmaya gerek yok ama standart olarak yazılabilir.
      tours,
    },
  });
});

// Başta "id" isimli bir değişken oluşturuluyor.
// :id/:x/:y şeklinde çoklu da olabiliyor ama URL olarak da o şekilde de çağrılması lazım eğer eksik parametre ile
// çağrılırsa error verir. Bu nedenle optional parametre olarak yazılabilir :id/:x/:y? şeklinde
app.get('/api/v1/tours/:id', (req, res) => {
  //console.log(req.params);

  const id = req.params.id * 1; //string to number işlemi. Burada çoklu parametre olsaydı (x ve y) .x ve .y ile erişecektik
  //const id = Number(req.params);

  //tours dizisinin tüm elemanlarını tek tek "el" içine alır. el.id'si id'ye eşitse o öğeyi döner. Yoksa undefined döner
  const tour = tours.find((el) => el.id === id);

  // burada bu şekilde kullanmak çok sorun değil. Gerçek bir uygulama yapmıyoruz...
  //if (id > tours.length) {
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invaid ID',
    });
  }

  res.status(200).json({
    status: 'success', //success, fail, error
    // results: tours.length, //json standardında bu alan genelde olmaz ama client tarafında işe yarayabilir diye yollanıyor
    data: {
      tour,
    },
  });
});

//create a new tour (client to server)
app.post('/api/v1/tours', (req, res) => {
  //console.log(req.body); //middleware'den gelen özellik. Tepeden kpatılırsa "undefined" olarak log'lanır

  const newId = tours[tours.length - 1].id + 1; //tours[8].id alınıp 1 fazlası newId'ye atandı
  const newTour = Object.assign({ id: newId }, req.body); //req.body alınıp içine { id: newId } keyi eklendi

  tours.push(newTour); //newTour tours içine eklendi (push)
  // event loop içinde olduğumuzdan sync versiyon kullanmayacağız. Sadece yukarda top level kodda kullandık
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // 200 kodu "ok", 201 kodu "created", 404 "not found" demek
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );

  // sadece tek response dönebilir. yukarıda json ile dönüldüğü için bunu yazamayız.
  // aslında önce burası işleyecek çünkü writeFile fonksiyonu async olarak kullanıldığından
  // orayı beklemeden geçecek buraya gelecek.
  //res.send('Done!');
});

// Update Tour
app.patch('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invaid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
});

// Delete Tour
app.delete('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invaid ID',
    });
  }

  // 204 kodu "no content" demek
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`); //buradaki tırnak işaretleri Alt Gr ile basılan ;'den geliyor
});
