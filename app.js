const carModels = [
  {
    name: "Tata Nexon EV",
    batteryKwh: 40.5,
    efficiencyWhPerKm: 145,
    maxDcKw: 50,
  },
  {
    name: "MG ZS EV",
    batteryKwh: 50.3,
    efficiencyWhPerKm: 158,
    maxDcKw: 70,
  },
  {
    name: "Hyundai Kona Electric",
    batteryKwh: 39.2,
    efficiencyWhPerKm: 142,
    maxDcKw: 50,
  },
  {
    name: "Mahindra XUV400",
    batteryKwh: 39.4,
    efficiencyWhPerKm: 150,
    maxDcKw: 50,
  },
];

const chargingStations = [
  { name: "Campus Gate FastCharge", city: "Pune", slots: 6, powerKw: 60 },
  { name: "GreenVolt City Hub", city: "Pune", slots: 4, powerKw: 30 },
  { name: "Metro EV Plaza", city: "Mumbai", slots: 8, powerKw: 120 },
  { name: "TechPark Charge Point", city: "Bengaluru", slots: 5, powerKw: 90 },
  { name: "Lakeview Charging Bay", city: "Bengaluru", slots: 3, powerKw: 30 },
];

const carModelSelect = document.getElementById("carModel");
const bookingCarModel = document.getElementById("bookingCarModel");
const cityFilter = document.getElementById("cityFilter");
const stationList = document.getElementById("stationList");
const bookingStation = document.getElementById("bookingStation");

function addOptions(selectEl, options, mapper = (v) => v) {
  selectEl.innerHTML = "";
  options.forEach((option) => {
    const item = mapper(option);
    const el = document.createElement("option");
    el.value = item.value;
    el.textContent = item.label;
    selectEl.appendChild(el);
  });
}

addOptions(carModelSelect, carModels, (car) => ({ value: car.name, label: car.name }));
addOptions(bookingCarModel, carModels, (car) => ({ value: car.name, label: car.name }));

const uniqueCities = ["All", ...new Set(chargingStations.map((s) => s.city))];
addOptions(cityFilter, uniqueCities, (city) => ({ value: city, label: city }));
addOptions(bookingStation, chargingStations, (station) => ({ value: station.name, label: `${station.name} (${station.city})` }));

function renderStations(selectedCity = "All") {
  const stations =
    selectedCity === "All"
      ? chargingStations
      : chargingStations.filter((s) => s.city === selectedCity);

  stationList.innerHTML = stations
    .map(
      (s) => `
      <article class="station">
        <strong>${s.name}</strong><br />
        City: ${s.city} | Power: ${s.powerKw} kW | Slots available: ${s.slots}
      </article>
    `,
    )
    .join("");
}

cityFilter.addEventListener("change", (e) => {
  renderStations(e.target.value);
});

renderStations();

function findCarModel(name) {
  return carModels.find((car) => car.name === name);
}

document.getElementById("rangeForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedCar = findCarModel(carModelSelect.value);
  const distance = Number(document.getElementById("distance").value);
  const speed = Number(document.getElementById("speed").value);
  const acPenalty = Number(document.getElementById("acUse").value);
  const passengers = Number(document.getElementById("passengers").value);

  const speedPenalty = speed > 80 ? (speed - 80) * 0.004 : 0;
  const passengerPenalty = Math.max(passengers - 1, 0) * 0.015;

  const adjustedEfficiency =
    selectedCar.efficiencyWhPerKm * (1 + acPenalty + speedPenalty + passengerPenalty);

  const availableWh = selectedCar.batteryKwh * 1000 * 0.92;
  const estimatedRangeKm = availableWh / adjustedEfficiency;
  const energyRequiredWh = distance * adjustedEfficiency;
  const batteryNeededPercent = (energyRequiredWh / (selectedCar.batteryKwh * 1000)) * 100;

  const canCompleteTrip = estimatedRangeKm >= distance;
  const chargingTimeAtMaxDc = (selectedCar.batteryKwh * 0.6) / selectedCar.maxDcKw;

  document.getElementById("rangeResult").innerHTML = `
    <strong>${selectedCar.name}</strong><br />
    Estimated practical range: <strong>${estimatedRangeKm.toFixed(1)} km</strong><br />
    Estimated battery needed for ${distance} km: <strong>${batteryNeededPercent.toFixed(1)}%</strong><br />
    Trip status: <strong>${canCompleteTrip ? "Trip possible without charging" : "Charging stop required"}</strong><br />
    Typical 20%-80% DC fast charge time: <strong>${(chargingTimeAtMaxDc * 60).toFixed(0)} minutes</strong>
  `;
});

document.getElementById("bookingForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const studentName = document.getElementById("studentName").value.trim();
  const carName = bookingCarModel.value;
  const stationName = bookingStation.value;
  const slotDate = document.getElementById("slotDate").value;
  const slotTime = document.getElementById("slotTime").value;

  if (!studentName || !slotDate || !slotTime) {
    document.getElementById("bookingResult").textContent =
      "Please fill all booking details.";
    return;
  }

  document.getElementById("bookingResult").innerHTML = `
    Booking Confirmed ✅<br />
    Student: <strong>${studentName}</strong><br />
    Car: <strong>${carName}</strong><br />
    Station: <strong>${stationName}</strong><br />
    Date & Time: <strong>${slotDate} ${slotTime}</strong>
  `;

  event.target.reset();
});
