import * as functions from 'firebase-functions';
import * as PDFDocument from 'pdfkit';
import * as admin from 'firebase-admin';
import * as QRCode from 'qrcode';

export const printCheckpoint = functions.https.onRequest((request, response) => {
  const pdf = new PDFDocument({size: 'A4'});

  const search = request.path.match(/brevet\/([^/]+)\/checkpoint\/([^/]+)/) || [];
  const [brevetUid, checkpointUid] = search.slice(1);
  if (!brevetUid || !checkpointUid) {
    console.error('UID search failed', search);
    return Promise.reject();
  }
  return admin.firestore()
    .collection('brevets').doc(brevetUid)
    .collection('checkpoints').doc(checkpointUid)
    .get().then(doc => {
      const checkpoint = doc.data() || {brevet: {}};
      const filename = `checkpoint-${checkpointUid}.pdf`;
      response.setHeader('Content-disposition', `inline; filename="${filename}"`);
      response.setHeader('Content-type', 'application/pdf');

      pdf.path('m243.37 183.71c3.6694-6.3397 5.7786-13.693 5.7786-21.543h-43.089z').fill('even-odd');
      pdf.path('m168.75 140.62c-3.6675 6.3397-5.7768 13.693-5.7768 21.543h43.089z').fill('even-odd');
      pdf.path('m251.2 162.17c0 24.933-20.209 45.14-45.14 45.14-24.932 0-45.142-20.208-45.142-45.14s20.209-45.14 45.142-45.14c24.93 0 45.14 20.208 45.14 45.14zm-45.14-41.04c-22.666 0-41.038 18.375-41.038 41.04 0 22.665 18.372 41.035 41.038 41.035 22.664 0 41.037-18.37 41.037-41.035 0-22.665-18.373-41.04-41.037-41.04z').fill('even-odd');
      pdf.path('m128.47 183.71c3.6684-6.3397 5.7777-13.693 5.7777-21.543h-43.088z').fill('even-odd');
      pdf.path('m53.844 140.62c-3.6675 6.3397-5.7768 13.693-5.7768 21.543h43.089z').fill('even-odd');
      pdf.path('m131.35 153.86c0.55064 2.6846 0.84088 5.4591 0.84088 8.3046 0 22.665-18.373 41.035-41.037 41.035-22.665 0-41.037-18.37-41.037-41.035 0-22.665 18.372-41.04 41.037-41.04 1.1311 0 2.2471 0.0615 3.355 0.15151l0.33522-4.0908c-1.2182-0.0994-2.4464-0.16098-3.6902-0.16098-24.931 0-45.141 20.208-45.141 45.14s20.21 45.14 45.141 45.14c24.93 0 45.14-20.208 45.14-45.14 0-3.1296-0.31912-6.1835-0.92516-9.1332z').fill('even-odd');
      pdf.path('m84.66 167.75 3.3223-3.4894h3.0832zm6.8378-7.1825 3.5145-3.693h9.6085l-6.7762 3.693zm7.0296-7.3861 3.5145-3.693h16.134l-6.7767 3.693zm7.03-7.3861 3.5145-3.693h18.057l4.1618 3.693h30.12l1.2575-3.693h-30.937l-6.7762 3.693zm7.03-7.3908 3.5141-3.693h2.7021l4.1618 3.693zm7.0295-7.3861 3.5146-3.693h-12.653l4.1618 3.693zm7.03-7.3861 3.5141-3.693h-28.008l4.1618 3.693zm7.0296-7.3861 3.5145-3.693h-43.363l4.1622 3.693zm7.03-7.3861 3.5145-3.693m3.5155-3.6978 3.5141-3.6883h26.517l-1.2575 3.6883zm7.03-7.3861 3.5141-3.693h22.004l-1.2585 3.693zm7.0296-7.3861 3.5141-3.693h17.491l-1.2585 3.693zm7.03-7.3861 3.5141-3.693h12.977l-1.2575 3.693zm7.0296-7.3861 3.5145-3.693h8.4637l-1.258 3.693zm7.03-7.3861 3.5146-3.693h3.9501l-1.2585 3.693zm7.0296-7.3908 2.6377-2.7698-0.94457 2.7698zm-14.664 48.019-1.258 3.693h18.738l6.7762-3.693h-114l4.1618 3.693h51.042m32.028 3.693-1.258 3.693h7.6986l6.7767-3.693zm-2.5165 7.3861-1.258 3.693h-3.3398l6.7758-3.693zm-2.5165 7.3861-1.258 3.693h-14.379l6.7762-3.693zm-2.5165 7.3861-1.258 3.693h-25.417l6.7758-3.693zm-5.0329 14.777-1.2585 3.693h-19.278l-4.1622-3.693zm-2.5165 7.3861-1.2585 3.693h-8.4367l-4.1618-3.693zm-2.517 7.3861-0.69978 2.0548-2.3152-2.0548z').fill('even-odd');

      pdf.registerFont('default', 'src/lucida.ttf');

      pdf.fontSize(45);
      pdf.font('default').text('Балтийская', 263, 80);
      pdf.font('default').text('звезда', 265, 115);
      pdf.fontSize(20);
      pdf.font('default').text('веломарафонский клуб', 265, 170);

      pdf.fontSize(30);
      pdf.font('default').text('Бревет ' + checkpoint.brevet.name,
        50, 220, {width: 550});
      pdf.font('default').text(checkpoint.displayName + ': ' +
        checkpoint.distance + ' км',
        50, 300, {width: 550});
      pdf.fontSize(20);
      const startDate = checkpoint.brevet.startDate.toDate();
      const displayDate = `${startDate.getDate()}.` +
        `${startDate.getMonth() + 1}.${startDate.getFullYear()}`;
      pdf.font('default').text(displayDate, 80, 260);

      const url = `https://brevet.online/c/${checkpointUid}`;
      return QRCode.toDataURL(url, {type: 'image/png', errorCorrectionLevel: 'M'});
    })
    .then(image => {
      pdf.image(image, 30, 360, {width: 350, height: 350});
      pdf.image(image, 380, 380, {width: 180, height: 180});
      pdf.image(image, 360, 580, {width: 100, height: 100});
      pdf.image(image, 465, 630, {width: 100, height: 100});
      pdf.pipe(response);
      pdf.end();
    })
    .catch(error => {
      console.error(`Can't print brevet ${brevetUid} checkpoint ${checkpointUid}`, error.message);
      response.sendStatus(500);
    });
});
