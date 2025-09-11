const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'User-Agent': 'Nome e versão da aplicação (email para contato técnico)',
      'content-type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTc1ODg5NzQsInN1YiI6InBtOGY3bFREMlpOSFQwRjRsNVBNTFpxbEltZjEifQ.QNLe4SysNaudhBIy3xlid18e2cM2wlMDgNCLPMkCkQc'
    },
    body: JSON.stringify({
      from: {postal_code: '01153000'},
      to: {postal_code: '20020050'},
      services: '1,2,17',
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: 0,
        use_insurance_value: false
      },
      package: {height: 2, width: 11, length: 16, weight: 0.3}
    })
  };
  
  fetch('https://api.superfrete.com/api/v0/calculator', options)
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(err => console.error(err));