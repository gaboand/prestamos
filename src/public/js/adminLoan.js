document.getElementById('adminLoanForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const loanId = document.getElementById('loanId').value;
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/accrue-interest';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'loanId';
    input.value = loanId;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
});
