async function filterLoans() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    try {
        const response = await fetch(`/api/loan?startDate=${startDate}&endDate=${endDate}`);
        const loans = await response.json();

        if (response.ok) {
            // Aquí deberías tener una función para mostrar los resultados
            displayLoans(loans);
        } else {
            alert('Error al filtrar préstamos: ' + loans.message);
        }
    } catch (error) {
        console.error('Error al filtrar préstamos:', error);
        alert('Error al filtrar préstamos.');
    }
}

function displayLoans(loans) {
    const loanListContainer = document.getElementById('loanListContainer');
    loanListContainer.innerHTML = ''; // Limpiar contenido previo

    if (loans.length === 0) {
        loanListContainer.innerHTML = '<p>No se encontraron préstamos en este rango de fechas.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Código</th>
                <th>Capital</th>
                <th>Tasa Anual</th>
                <th>Cuotas</th>
                <th>Estado</th>
                <th>Fecha de Alta</th>
                <th>Fecha de Vencimiento</th>
            </tr>
        </thead>
        <tbody>
            ${loans.map(loan => `
                <tr>
                    <td>${loan.codigo}</td>
                    <td>${loan.capital}</td>
                    <td>${loan.tasaAnual}%</td>
                    <td>${loan.cuotas}</td>
                    <td>${loan.estado}</td>
                    <td>${new Date(loan.fechaAlta).toLocaleDateString()}</td>
                    <td>${new Date(loan.fechaVencimientoPrimerCuota).toLocaleDateString()}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    loanListContainer.appendChild(table);
}
