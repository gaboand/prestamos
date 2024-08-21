document.addEventListener('DOMContentLoaded', () => {
    const simulateButton = document.getElementById('simulateLoanButton');
    const loanForm = document.getElementById('loanForm');
    const createLoanForm = document.getElementById('createLoanForm');
    const newClientModal = document.getElementById('newClientModal');
    const closeModal = document.getElementsByClassName('close')[0];
    const newClientForm = document.getElementById('newClientForm');

    simulateButton.addEventListener('click', simulateLoan);

    createLoanForm.addEventListener('submit', confirmLoan);

        closeModal.onclick = function() {
            newClientModal.style.display = 'none';
        }
    
        window.onclick = function(event) {
            if (event.target == newClientModal) {
                newClientModal.style.display = 'none';
            }
        }
    
        newClientForm.addEventListener('submit', registerNewClient);

    document.querySelector('.close').addEventListener('click', closeClientRegistrationPopup);
});

async function simulateLoan() {
    const form = document.getElementById('loanForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/loan/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('simulationResult').innerHTML = generateResultHTML(result);
            document.getElementById('simulationResultContainer').style.display = 'block';
            document.getElementById('createLoanForm').style.display = 'block';
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al simular el préstamo.');
    }
}

function generateResultHTML(result) {
    let html = `
        <div class="result-columns">
            <div class="left-column">
                <p>Capital: ${parseFloat(result.capital).toFixed(2)}</p>
                <p>Tasa Anual: ${parseFloat(result.tasaAnual)}%</p>
                <p>Cuotas: ${parseInt(result.cuotas)}</p>
                <p>IVA: ${parseFloat(result.iva)}%</p>
            </div>
            <div class="right-column">
                <p>Fee Mensual: ${parseFloat(result.feeMensual).toFixed(2)}</p>
                <p>Costo de Otorgamiento: ${parseFloat(result.costoOtorgamiento).toFixed(2)}</p>
                <p>Sellado: ${parseFloat(result.sellado)}%</p>
                <p>Valor de Sellado: ${parseFloat(result.selladoAmount).toFixed(2)}</p>
                <p>Fecha de Vencimiento de la Primera Cuota: ${new Date(result.fechaPrimerVencimiento).toLocaleDateString('en-GB')}</p>
            </div>
        </div>
        <h2>Plan de Pagos</h2>
        <table>
            <thead>
                <tr>
                    <th>Cuota</th>
                    <th>Capital Pendiente</th>
                    <th>Interés</th>
                    <th>IVA sobre Interés</th>
                    <th>Amortización</th>
                    <th>Fee Mensual</th>
                    <th>Cuota sin IVA</th>
                    <th>Cuota Total</th>
                    <th>Fecha de Vencimiento</th>
                </tr>
            </thead>
            <tbody>`;

    result.planDePagos.forEach(pago => {
        const cuotaSinIva = parseFloat(pago.amortizacion) + parseFloat(pago.interes);
        const cuotaTotal = cuotaSinIva + parseFloat(pago.interesConIva) + parseFloat(pago.feeMensual);
        const fechaVencimiento = new Date(pago.fechaVencimiento).toLocaleDateString('en-GB');
        html += `
            <tr>
                <td>${parseInt(pago.cuota)}</td>
                <td>${parseFloat(pago.capitalPendiente).toFixed(2)}</td>
                <td>${parseFloat(pago.interes).toFixed(2)}</td>
                <td>${parseFloat(pago.interesConIva).toFixed(2)}</td>
                <td>${parseFloat(pago.amortizacion).toFixed(2)}</td>
                <td>${parseFloat(pago.feeMensual).toFixed(2)}</td>
                <td>${cuotaSinIva.toFixed(2)}</td>
                <td>${cuotaTotal.toFixed(2)}</td>
                <td>${fechaVencimiento}</td>
            </tr>`;
    });

    html += `
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="2">Totales</th>
                    <th>${result.totalInteres}</th>
                    <th>${result.totalInteresConIva}</th>
                    <th>${result.totalAmortizacion}</th>
                    <th>${result.totalFeeMensual}</th>
                    <th>${(parseFloat(result.totalAmortizacion) + parseFloat(result.totalInteres)).toFixed(2)}</th>
                    <th>${(parseFloat(result.totalAmortizacion) + parseFloat(result.totalInteres) + parseFloat(result.totalInteresConIva) + parseFloat(result.totalFeeMensual)).toFixed(2)}</th>
                </tr>
            </tfoot>
        </table>`;

    return html;
}

async function confirmLoan(event) {
    event.preventDefault();

    const dniCliente = document.getElementById('dniCliente').value;

    if (!dniCliente || dniCliente.trim() === '') {
        console.error('DNI recibido: ', dniCliente);
        alert('Por favor, ingrese el DNI.');
        return;
    }

    const form = document.getElementById('createLoanForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    data.dniCliente = dniCliente;
    data.capital = document.getElementById('capital').value;
    data.tasaAnual = document.getElementById('tasaAnual').value;
    data.cuotas = document.getElementById('cuotas').value;
    data.iva = document.getElementById('iva').value;
    data.feeMensual = document.getElementById('feeMensual').value;
    data.costoOtorgamiento = document.getElementById('costoOtorgamiento').value;
    data.sellado = document.getElementById('sellado').value;
    data.fechaPrimerVencimiento = document.getElementById('fechaPrimerVencimiento').value;


    try {
        const response = await fetch('/api/loan/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            document.getElementById('simulationResult').innerHTML = generateLoanDetailHTML(result.loan);
            document.getElementById('simulationResultContainer').style.display = 'block';

            document.getElementById('createLoanForm').style.display = 'none';
            showNewOperationButton();

        } else if (result.error === 'Cliente no encontrado') {
            alert('El cliente no fue encontrado. Por favor, ingrese los datos para registrar al nuevo cliente.');
            openClientRegistrationPopup();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al confirmar el préstamo.');
    }
}

function openClientRegistrationPopup() {
    const popup = document.getElementById('newClientModal');
    if (popup) {
        popup.style.display = 'block';
    } else {
        console.error('Popup de registro de cliente no encontrado.');
    }
}

function closeClientRegistrationPopup() {
    const popup = document.getElementById('newClientModal');
    if (popup) {
        popup.style.display = 'none';
    } else {
        console.error('Popup de registro de cliente no encontrado.');
    }
}

async function registerNewClient(event) {
    event.preventDefault();

    const form = document.getElementById('newClientForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/client/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Cliente registrado exitosamente.');
            newClientModal.style.display = 'none';
            document.getElementById('dniCliente').value = result.client.dni;
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar el cliente.');
    }
}

function generateLoanDetailHTML(loan) {
    let html = `
        <h1>Préstamo Registrado - Detalles de la Operación</h1>
        <div class="result-columns">
            <div class="left-column">
                <p>Capital: ${parseFloat(loan.capital).toFixed(2)}</p>
                <p>Tasa Anual: ${parseFloat(loan.tasaAnual)}%</p>
                <p>Cuotas: ${parseInt(loan.cuotas)}</p>
                <p>IVA: ${parseFloat(loan.iva)}%</p>
            </div>
            <div class="right-column">
                <p>Fee Mensual: ${parseFloat(loan.feeMensual).toFixed(2)}</p>
                <p>Costo de Otorgamiento: ${parseFloat(loan.costoOtorgamiento).toFixed(2)}</p>
                <p>Sellado: ${parseFloat(loan.sellado)}%</p>
                <p>Valor de Sellado: ${parseFloat(loan.selladoAmount).toFixed(2)}</p>
                <p>Fecha de Alta: ${new Date(loan.fechaAlta).toLocaleDateString('en-GB')}</p>
                <p>Fecha de Vencimiento de la Primera Cuota: ${new Date(loan.fechaVencimientoPrimerCuota).toLocaleDateString('en-GB')}</p>
            </div>
        </div>
        <h2>Plan de Pagos</h2>
        <table>
            <thead>
                <tr>
                    <th>Cuota</th>
                    <th>Capital Pendiente</th>
                    <th>Interés</th>
                    <th>IVA sobre Interés</th>
                    <th>Amortización</th>
                    <th>Fee Mensual</th>
                    <th>Cuota Total Sin IVA</th>
                    <th>Cuota Total Con IVA</th>
                    <th>Fecha de Vencimiento</th>
                </tr>
            </thead>
            <tbody>`;

    loan.planDePagos.forEach(pago => {
        const cuotaSinIva = parseFloat(pago.amortizacion) + parseFloat(pago.interes);
        const cuotaTotal = cuotaSinIva + parseFloat(pago.interesConIva) + parseFloat(pago.feeMensual);
        const fechaVencimiento = new Date(pago.fechaVencimiento).toLocaleDateString('en-GB');
        html += `
            <tr>
                <td>${parseInt(pago.cuota)}</td>
                <td>${parseFloat(pago.capitalPendiente).toFixed(2)}</td>
                <td>${parseFloat(pago.interes).toFixed(2)}</td>
                <td>${parseFloat(pago.interesConIva).toFixed(2)}</td>
                <td>${parseFloat(pago.amortizacion).toFixed(2)}</td>
                <td>${parseFloat(pago.feeMensual).toFixed(2)}</td>
                <td>${cuotaSinIva.toFixed(2)}</td>
                <td>${cuotaTotal.toFixed(2)}</td>
                <td>${fechaVencimiento}</td>
            </tr>`;
    });

    html += `
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="2">Totales</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.interes), 0).toFixed(2)}</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.interesConIva), 0).toFixed(2)}</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.amortizacion), 0).toFixed(2)}</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.feeMensual), 0).toFixed(2)}</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.amortizacion) + parseFloat(curr.interes), 0).toFixed(2)}</th>
                    <th>${loan.planDePagos.reduce((acc, curr) => acc + parseFloat(curr.amortizacion) + parseFloat(curr.interes) + parseFloat(curr.interesConIva) + parseFloat(curr.feeMensual), 0).toFixed(2)}</th>
                </tr>
            </tfoot>
        </table>`;

    return html;
}

function showNewOperationButton() {
    const newOperationButton = document.createElement('button');
    newOperationButton.innerText = 'Nueva Operación';
    newOperationButton.className = 'btn-primary';
    newOperationButton.onclick = function() {
        window.location.reload();
    };

    document.getElementById('simulationResultContainer').appendChild(newOperationButton);
}