document.getElementById('loanSearchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const codigo = document.getElementById('codigo').value;
    window.location.href = `/api/loan/code/${codigo}`;
});
