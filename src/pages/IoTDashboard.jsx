import { useState, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'

const initialSensors = {
  temperature: 28.4, humidity: 62, soilMoisture: 45, lightIntensity: 650, waterLevel: 75, airQualityKey: 'statusGood',
}

function statusKeyFor(key, value) {
  if (key === 'soilMoisture') return value < 50 ? 'statusModerate' : 'statusGood'
  if (key === 'waterLevel') return value < 30 ? 'statusLow' : 'statusGood'
  return 'statusNormal'
}

function IoTDashboard() {
  // useContext - reads the translation helper from AppContext
  const { t } = useContext(AppContext)

  // useState - stores live sensor readings
  const [sensors, setSensors] = useState(initialSensors)

  // useEffect + setInterval - simulates changing IoT sensor values every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prev) => ({
        temperature: +(prev.temperature + (Math.random() - 0.5)).toFixed(1),
        humidity: Math.min(100, Math.max(0, prev.humidity + Math.floor(Math.random() * 5 - 2))),
        soilMoisture: Math.min(100, Math.max(0, prev.soilMoisture + Math.floor(Math.random() * 5 - 2))),
        lightIntensity: Math.max(0, prev.lightIntensity + Math.floor(Math.random() * 40 - 20)),
        waterLevel: Math.min(100, Math.max(0, prev.waterLevel + Math.floor(Math.random() * 3 - 1))),
        airQualityKey: prev.airQualityKey,
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const cards = [
    { labelKey: 'sensorTemperature', value: `${sensors.temperature}°C`, icon: '🌡️', statusKey: 'statusNormal' },
    { labelKey: 'sensorHumidity', value: `${sensors.humidity}%`, icon: '💧', statusKey: 'statusNormal' },
    { labelKey: 'soilMoistureLabel', value: `${sensors.soilMoisture}%`, icon: '🌱', statusKey: statusKeyFor('soilMoisture', sensors.soilMoisture) },
    { labelKey: 'sensorLight', value: `${sensors.lightIntensity} lux`, icon: '💡', statusKey: 'statusGood' },
    { labelKey: 'waterLevelLabel', value: `${sensors.waterLevel}%`, icon: '🚰', statusKey: statusKeyFor('waterLevel', sensors.waterLevel) },
    { labelKey: 'sensorAirQuality', value: t(sensors.airQualityKey), icon: '🍃', statusKey: null, statusText: 'AQI 42' },
  ]

  return (
      <div className="page-content">
        <div className="dash-title mb-24">{t('iotTitle')}</div>
        <div className="grid grid-3 mb-24">
          {cards.map((c) => (
            <div key={c.labelKey} className="card">
              <div className="flex-between mb-8">
                <span style={{ fontSize: 'calc(22px * var(--font-scale, 1))' }}>{c.icon}</span>
                <span className="badge badge-success">{c.statusKey ? t(c.statusKey) : c.statusText}</span>
              </div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{t(c.labelKey)}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">{t('sensorHistory')}</div>
          <svg viewBox="0 0 400 100" style={{ width: '100%', height: 160 }}>
            <polyline fill="none" stroke="#1e88e5" strokeWidth="2.5" points="0,60 40,50 80,70 120,40 160,55 200,30 240,50 280,35 320,60 360,45 400,55" />
          </svg>
          <div className="flex-between text-muted" style={{ fontSize: 'calc(11px * var(--font-scale, 1))' }}>
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
          </div>
        </div>
    </div>
  )
}

export default IoTDashboard
