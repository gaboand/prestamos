document.getElementById('adminLoanForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const codigo = document.getElementById('codigo').value;
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/administration/accrue-interest';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'codigo';
    input.value = codigo;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
});

