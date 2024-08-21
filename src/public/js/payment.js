document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const loanDetailsContainer = document.getElementById('loanDetailsContainer');

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const codigo = document.getElementById('loanId').value;
        if (codigo.trim() === '') {
            alert('Por favor, ingrese el número del préstamo.');
            return;
        }

        try {
            const response = await fetch(`/api/payment/search?codigo=${codigo}`);
            const result = await response.json();

            if (response.ok) {
                loanDetailsContainer.innerHTML = generateLoanDetailsHTML(result.loan);
                // Ahora que el HTML está generado, asignamos el evento al formulario de pago
                document.getElementById('paymentForm').addEventListener('submit', registerPayment);
            } else {
                alert(result.message);
                loanDetailsContainer.innerHTML = ''; // Limpiar los detalles si no se encuentra el préstamo
            }
        } catch (error) {
            console.error('Error al buscar el préstamo:', error);
            alert('Error al buscar el préstamo.');
        }
    });
});

// Función para generar el HTML con los detalles del préstamo
function generateLoanDetailsHTML(loan) {
    let html = `
        <h2>Detalles del Préstamo</h2>
        <p><strong>Número de Préstamo:</strong> ${loan.codigo}</p>
        <p><strong>Capital:</strong> ${loan.capital}</p>
        <p><strong>Tasa Anual:</strong> ${loan.tasaAnual}%</p>
        <p><strong>Cuotas:</strong> ${loan.cuotas}</p>
        <p><strong>IVA:</strong> ${loan.iva}%</p>
        <p><strong>Estado:</strong> ${loan.estado}</p>
        <h3>Plan de Pagos</h3>
        <table>
            <thead>
                <tr>
                    <th>Cuota</th>
                    <th>Capital Pendiente</th>
                    <th>Interés</th>
                    <th>Amortización</th>
                    <th>Cuota Total</th>
                    <th>Fecha de Vencimiento</th>
                    <th>Días de Mora</th>
                    <th>Pagado</th>
                </tr>
            </thead>
            <tbody>`;
    
    loan.planDePagos.forEach((cuota) => {
        html += `
            <tr>
                <td>${cuota.cuota}</td>
                <td>${cuota.capitalPendiente}</td>
                <td>${cuota.interes}</td>
                <td>${cuota.amortizacion}</td>
                <td>${cuota.cuotaConFee}</td>
                <td>${new Date(cuota.fechaVencimiento).toLocaleDateString()}</td>
                <td>${cuota.diasMora || 0}</td>
                <td>${cuota.pagado ? 'Sí' : 'No'}</td>
            </tr>`;
    });

    html += `
            </tbody>
        </table>
        <h3>Registrar Pago</h3>
        <form id="paymentForm">
            <label for="amount">Monto:</label>
            <input type="number" id="amount" name="amount" required>
            
            <label for="cuota">Cuota:</label>
            <select id="cuota" name="cuota" required>
                ${loan.planDePagos.map(cuota => `
                    <option value="${cuota.cuota}">Cuota ${cuota.cuota} - Vence ${new Date(cuota.fechaVencimiento).toLocaleDateString()}</option>
                `).join('')}
            </select>

            <label for="canal">Canal:</label>
            <select id="canal" name="canal" required>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
            </select>

            <button type="submit" class="btn-primary">Registrar Pago</button>
        </form>
        <div id="paymentResult"></div>
    `;

    return html;
}

// Función para registrar un pago
async function registerPayment(event) {
    event.preventDefault();

    const form = document.getElementById('paymentForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.codigo = document.getElementById('loanId').value;

    try {
        const response = await fetch('/api/payment/make', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('paymentResult').innerHTML = `<p>Pago registrado correctamente.</p>`;
            document.getElementById('loanDetailsContainer').innerHTML = generateLoanDetailsHTML(result.loan);
            // Vuelve a asignar el evento para el nuevo formulario generado
            document.getElementById('paymentForm').addEventListener('submit', registerPayment);
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error al registrar el pago:', error);
        alert('Error al registrar el pago.');
    }
}
