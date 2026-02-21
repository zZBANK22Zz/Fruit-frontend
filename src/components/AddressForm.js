import { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import Modal from './Modal';
import thaiAddressData from '../data/thaiAddressData.json';

const mapContainerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '12px',
};

const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018,
};

// Reusable styled components
const FieldLabel = ({ children, required }) => (
  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const ErrorMsg = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span>{msg}</p> : null;

const inputClass = (hasError) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 bg-white transition-all duration-200 outline-none
   focus:ring-2 focus:ring-orange-400 focus:border-orange-400
   ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`;

const selectClass = (hasError, disabled) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none
   focus:ring-2 focus:ring-orange-400 focus:border-orange-400 appearance-none bg-white
   ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'text-gray-800 cursor-pointer hover:border-gray-300'}
   ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

const SelectWrapper = ({ children }) => (
  <div className="relative">
    {children}
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

const AddressForm = ({ isOpen, onClose, onSave, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    address_line: '',
    sub_district: '',
    district: '',
    province: '',
    postal_code: '',
    latitude: null,
    longitude: null,
  });
  const [errors, setErrors] = useState({});
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const provinces = useMemo(
    () => [...new Set(thaiAddressData.map((i) => i.provinceNameTh))].sort(),
    []
  );

  const districts = useMemo(() => {
    if (!formData.province) return [];
    return [...new Set(
      thaiAddressData
        .filter((i) => i.provinceNameTh === formData.province)
        .map((i) => i.districtNameTh)
    )].sort();
  }, [formData.province]);

  const subDistricts = useMemo(() => {
    if (!formData.province || !formData.district) return [];
    return [...new Set(
      thaiAddressData
        .filter((i) => i.provinceNameTh === formData.province && i.districtNameTh === formData.district)
        .map((i) => i.subdistrictNameTh)
    )].sort();
  }, [formData.province, formData.district]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        address_line: initialData.address_line || '',
        sub_district: initialData.sub_district || '',
        district: initialData.district || '',
        province: initialData.province || '',
        postal_code: initialData.postal_code || '',
        latitude: initialData.latitude ? parseFloat(initialData.latitude) : null,
        longitude: initialData.longitude ? parseFloat(initialData.longitude) : null,
      });
      if (initialData.latitude && initialData.longitude) {
        setMapCenter({
          lat: parseFloat(initialData.latitude),
          lng: parseFloat(initialData.longitude),
        });
      }
    } else {
      setFormData({
        address_line: '',
        sub_district: '',
        district: '',
        province: '',
        postal_code: '',
        latitude: null,
        longitude: null,
      });
      setMapCenter(defaultCenter);
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Auto-geocode when sub_district is selected to pan the map
  useEffect(() => {
    if (!formData.sub_district || !formData.district || !formData.province) return;
    if (!isLoaded) return;

    const addressQuery = `${formData.sub_district}, ${formData.district}, ${formData.province}, Thailand`;
    setIsGeocoding(true);

    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        addressQuery
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=th`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setMapCenter({ lat, lng });
          setFormData((prev) => {
            if (!prev.latitude || !prev.longitude) {
              return { ...prev, latitude: lat, longitude: lng };
            }
            return prev;
          });
          if (errors.map) setErrors((prev) => ({ ...prev, map: '' }));
        }
      })
      .catch((err) => console.error('Geocoding error:', err))
      .finally(() => setIsGeocoding(false));
  }, [formData.sub_district, formData.district, formData.province, isLoaded]);

  const validate = () => {
    const newErrors = {};
    if (!formData.address_line.trim()) newErrors.address_line = 'กรุณากรอกที่อยู่';
    if (!formData.province) newErrors.province = 'กรุณาเลือกจังหวัด';
    if (!formData.district) newErrors.district = 'กรุณาเลือกเขต/อำเภอ';
    if (!formData.sub_district) newErrors.sub_district = 'กรุณาเลือกแขวง/ตำบล';
    if (!formData.postal_code) newErrors.postal_code = 'กรุณากรอกรหัสไปรษณีย์';
    if (!formData.latitude || !formData.longitude) newErrors.map = 'กรุณาปักหมุดตำแหน่งที่อยู่บนแผนที่';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (validate()) onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData((prev) => ({ ...prev, province, district: '', sub_district: '', postal_code: '' }));
    if (errors.province) setErrors((prev) => ({ ...prev, province: '' }));
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setFormData((prev) => ({ ...prev, district, sub_district: '', postal_code: '' }));
    if (errors.district) setErrors((prev) => ({ ...prev, district: '' }));
  };

  const handleSubDistrictChange = (e) => {
    const sub_district = e.target.value;
    const match = thaiAddressData.find(
      (i) =>
        i.provinceNameTh === formData.province &&
        i.districtNameTh === formData.district &&
        i.subdistrictNameTh === sub_district
    );
    setFormData((prev) => ({
      ...prev,
      sub_district,
      postal_code: match ? match.postalCode.toString() : '',
    }));
    if (errors.sub_district) setErrors((prev) => ({ ...prev, sub_district: '' }));
    if (errors.postal_code) setErrors((prev) => ({ ...prev, postal_code: '' }));
  };

  const handleMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      if (errors.map) setErrors((prev) => ({ ...prev, map: '' }));
    },
    [errors.map]
  );

  const handleMarkerDragEnd = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      if (errors.map) setErrors((prev) => ({ ...prev, map: '' }));
    },
    [errors.map]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
      showCloseButton={true}
      buttonText={initialData ? 'บันทึกการแก้ไข' : 'บันทึกที่อยู่'}
      onConfirm={handleSubmit}
    >
      <form className="space-y-5 mt-3" onSubmit={handleSubmit}>

        {/* Address Line */}
        <div>
          <FieldLabel required>รายละเอียดที่อยู่</FieldLabel>
          <p className="text-xs text-gray-400 mb-1.5">บ้านเลขที่, หมู่, ซอย, ถนน</p>
          <textarea
            name="address_line"
            rows="2"
            value={formData.address_line}
            onChange={handleChange}
            placeholder="เช่น 123/45 หมู่บ้านX ถนนY"
            className={inputClass(errors.address_line) + ' resize-none'}
          />
          <ErrorMsg msg={errors.address_line} />
        </div>

        {/* Province + District */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required>จังหวัด</FieldLabel>
            <SelectWrapper>
              <select
                name="province"
                value={formData.province}
                onChange={handleProvinceChange}
                className={selectClass(errors.province, false)}
              >
                <option value="">เลือกจังหวัด</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </SelectWrapper>
            <ErrorMsg msg={errors.province} />
          </div>

          <div>
            <FieldLabel required>เขต / อำเภอ</FieldLabel>
            <SelectWrapper>
              <select
                name="district"
                value={formData.district}
                onChange={handleDistrictChange}
                disabled={!formData.province}
                className={selectClass(errors.district, !formData.province)}
              >
                <option value="">เลือกเขต/อำเภอ</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </SelectWrapper>
            <ErrorMsg msg={errors.district} />
          </div>
        </div>

        {/* Sub-district + Postal Code */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required>แขวง / ตำบล</FieldLabel>
            <SelectWrapper>
              <select
                name="sub_district"
                value={formData.sub_district}
                onChange={handleSubDistrictChange}
                disabled={!formData.district}
                className={selectClass(errors.sub_district, !formData.district)}
              >
                <option value="">เลือกแขวง/ตำบล</option>
                {subDistricts.map((sd) => (
                  <option key={sd} value={sd}>{sd}</option>
                ))}
              </select>
            </SelectWrapper>
            <ErrorMsg msg={errors.sub_district} />
          </div>

          <div>
            <FieldLabel>รหัสไปรษณีย์</FieldLabel>
            <div className="relative">
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                readOnly
                maxLength="5"
                placeholder="อัตโนมัติ"
                className={`${inputClass(errors.postal_code)} bg-gray-50 text-gray-500 cursor-not-allowed`}
              />
              {formData.postal_code && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <span className="text-green-500 text-sm">✓</span>
                </div>
              )}
            </div>
            <ErrorMsg msg={errors.postal_code} />
          </div>
        </div>

        {/* Map Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel required>ปักหมุดตำแหน่ง</FieldLabel>
            {isGeocoding && (
              <span className="text-xs text-orange-500 flex items-center gap-1 animate-pulse">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                กำลังค้นหาตำแหน่ง...
              </span>
            )}
          </div>

          {/* Map tip box */}
          {!formData.latitude && !formData.longitude && !isGeocoding && (
            <div className="flex items-start gap-2 p-3 mb-2 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              เลือกจังหวัด/อำเภอ/ตำบล แล้วแผนที่จะนำทางให้อัตโนมัติ จากนั้นคลิกหรือลากหมุดเพื่อระบุตำแหน่งที่แน่นอน
            </div>
          )}

          <div className={`rounded-2xl overflow-hidden border-2 transition-colors ${errors.map ? 'border-red-400' : 'border-gray-200'}`}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={15}
                onClick={handleMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                  zoomControlOptions: { position: 9 },
                }}
              >
                {formData.latitude && formData.longitude && (
                  <Marker
                    position={{ lat: formData.latitude, lng: formData.longitude }}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="h-[320px] w-full bg-gray-100 animate-pulse flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-10l6-3m0 16l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7" />
                  </svg>
                  <p className="text-sm">กำลังโหลดแผนที่...</p>
                </div>
              </div>
            )}
          </div>

          {/* Coordinate display + error */}
          <div className="flex items-center justify-between mt-2 px-1">
            {formData.latitude && formData.longitude ? (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ปักหมุดแล้ว: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
              </p>
            ) : (
              <p className="text-xs text-gray-400">ยังไม่ได้ปักหมุด</p>
            )}
            {errors.map && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <span>⚠</span> {errors.map}
              </p>
            )}
          </div>
        </div>

      </form>
    </Modal>
  );
};

export default AddressForm;
