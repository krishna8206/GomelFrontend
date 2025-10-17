import { useEffect, useState } from 'react';

const emptyCar = {
  name: '',
  type: 'SUV',
  fuel: 'Petrol',
  transmission: 'Manual',
  pricePerDay: 0,
  rating: 0,
  seats: 5,
  image: '',
  city: '',
  brand: '',
  description: '',
  available: true,
};

const CarModal = ({ open, onClose, onSave, initial }) => {
  const [car, setCar] = useState(initial || emptyCar);

  useEffect(() => {
    setCar(initial || emptyCar);
  }, [initial, open]);

  if (!open) return null;

  const handleChange = (key, val) => setCar((c) => ({ ...c, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(car);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full md:max-w-3xl bg-white rounded-xl border border-primary/20 shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10 rounded-t-xl">
          <h3 className="text-xl font-bold text-primary">{car.id ? 'Edit Car' : 'Add Car'}</h3>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          <div>
            <label className="block text-sm text-muted mb-1">Name</label>
            <input value={car.name} onChange={(e)=>handleChange('name', e.target.value)} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Brand</label>
            <input value={car.brand} onChange={(e)=>handleChange('brand', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">City</label>
            <input value={car.city} onChange={(e)=>handleChange('city', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Type</label>
            <select value={car.type} onChange={(e)=>handleChange('type', e.target.value)} className="w-full px-3 py-2 border rounded">
              <option>SUV</option>
              <option>Hatchback</option>
              <option>Sedan</option>
              <option>Electric</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Fuel</label>
            <select value={car.fuel} onChange={(e)=>handleChange('fuel', e.target.value)} className="w-full px-3 py-2 border rounded">
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Transmission</label>
            <select value={car.transmission} onChange={(e)=>handleChange('transmission', e.target.value)} className="w-full px-3 py-2 border rounded">
              <option>Manual</option>
              <option>Automatic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Seats</label>
            <input type="number" min={2} max={10} value={car.seats} onChange={(e)=>handleChange('seats', Number(e.target.value)||5)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Price / Day (₹)</label>
            <input type="number" min={0} step={50} value={car.pricePerDay} onChange={(e)=>handleChange('pricePerDay', Number(e.target.value)||0)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-muted mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  handleChange('imageData', reader.result);
                };
                reader.readAsDataURL(file);
              }}
              className="w-full px-3 py-2 border rounded"
            />
            {(car.imageData || car.image) ? (
              <img src={car.imageData || car.image} alt="preview" className="mt-2 h-40 object-cover rounded border" />
            ) : null}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-muted mb-1">Description</label>
            <textarea rows={3} value={car.description} onChange={(e)=>handleChange('description', e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2 sticky bottom-0 bg-white py-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryDark">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarModal;
