document.getElementById('formRegistroProcedimiento').addEventListener('submit', function(event) {
  event.preventDefault();

  // Obtener datos del formulario (ajusta los IDs si es necesario)
  const nombrePaciente    = document.getElementById('nombrePaciente').value;
  const pacienteId        = document.getElementById('pacienteId').value;       // ID del recurso Patient
  const nombreCirujano    = document.getElementById('nombreCirujano').value;
  const cirujanoId        = document.getElementById('cirujanoId').value;       // ID del Practitioner
  const fechaProcedimiento = document.getElementById('fechaProcedimiento').value;  // formato ISO date-time
  const codigoProcedimiento = document.getElementById('codigoProcedimiento').value; // Ejemplo SNOMED
  const resultadoProcedimiento = document.getElementById('resultadoProcedimiento').value;
  
  // Datos para prescripción simple de medicamento
  const medicamentoNombre = document.getElementById('medicamentoNombre').value;
  const dosis             = document.getElementById('dosis').value;
  const frecuencia        = document.getElementById('frecuencia').value;

  // Crear objeto Procedure FHIR
  const procedureFHIR = {
    resourceType: "Procedure",
    status: "completed",
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: codigoProcedimiento,
          display: "Procedimiento quirúrgico"
        }
      ],
      text: "Procedimiento quirúrgico"
    },
    subject: {
      reference: `Patient/${pacienteId}`,
      display: nombrePaciente
    },
    performer: [
      {
        actor: {
          reference: `Practitioner/${cirujanoId}`,
          display: nombreCirujano
        }
      }
    ],
    performedDateTime: fechaProcedimiento,
    note: [
      {
        text: resultadoProcedimiento
      }
    ]
  };

  // Crear objeto MedicationRequest FHIR para prescripción simple
  const medicationRequestFHIR = {
    resourceType: "MedicationRequest",
    status: "active",
    intent: "order",
    medicationCodeableConcept: {
      text: medicamentoNombre
    },
    subject: {
      reference: `Patient/${pacienteId}`,
      display: nombrePaciente
    },
    dosageInstruction: [
      {
        text: `Dosis: ${dosis}, Frecuencia: ${frecuencia}`
      }
    ],
    authoredOn: new Date().toISOString(),
    requester: {
      reference: `Practitioner/${cirujanoId}`,
      display: nombreCirujano
    }
  };

  // Construir payload para enviar al backend (puedes enviar ambos recursos juntos o separados según API)
  const payload = {
    procedure: procedureFHIR,
    medicationRequest: medicationRequestFHIR
  };

  console.log('Datos para registrar procedimiento:', payload);

  fetch('https://hl7-fhir-ehr-karol-1.onrender.com/procedure/', {  // Ajusta endpoint si es necesario
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) throw new Error('Error en la solicitud: ' + response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('Procedimiento registrado:', data);
    alert('Procedimiento quirúrgico registrado exitosamente! ID: ' + (data._id || 'desconocido'));
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error al registrar procedimiento: ' + error.message);
  });
});
