import React, { useEffect, useState } from "react";

export interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  province: string;
  provinceName: string;
  district: string;
  districtName: string;
  address: string;
}

type Props = {
  value: ShippingInfo;
  onChange: (val: ShippingInfo) => void;
};

interface Province {
  code: string;
  name: string;
}
interface District {
  code: string;
  name: string;
}

export default function ShippingAddressForm({ value, onChange }: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    setLoadingProvinces(true);
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data: Province[]) => {
        setProvinces(data);
        setLoadingProvinces(false);
      })
      .catch(() => setLoadingProvinces(false));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!value.province) {
      setDistricts([]);
      onChange({ ...value, district: "", districtName: "" });
      return;
    }
    setLoadingDistricts(true);
    fetch(`https://provinces.open-api.vn/api/p/${value.province}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        setDistricts((data.districts || []) as District[]);
        setLoadingDistricts(false);
      })
      .catch(() => setLoadingDistricts(false));
  }, [value.province]);

  return (
    <div className="bg-[#161625] rounded-lg border border-[#2A2A40] p-6 w-full">
      <div className="flex items-center mb-4">
        <input type="checkbox" className="mr-2 accent-[#00FFFF] w-4 h-4 border-[#2A2A40]" />
        <span className="font-semibold text-lg text-white select-none">ĐỊA CHỈ NHẬN HÀNG</span>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Họ và tên"
          className="w-full border border-[#2A2A40] rounded bg-[#1A1A2E] px-3 py-2 outline-none text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#00FFFF]/30"
          value={value.name}
          onChange={e => onChange({ ...value, name: e.target.value })}
        />
        <div className="flex gap-2">
          <div className="w-1/2">
            <input
              type="email"
              placeholder="Email (không bắt buộc)"
              className="w-full border border-[#2A2A40] rounded bg-[#1A1A2E] px-3 py-2 outline-none text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#00FFFF]/30"
              value={value.email}
              onChange={e => onChange({ ...value, email: e.target.value })}
            />
          </div>
          <input
            type="tel"
            placeholder="Số điện thoại"
            className="w-1/2 border border-[#2A2A40] rounded bg-[#1A1A2E] px-3 py-2 outline-none text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#00FFFF]/30 mt-0"
            value={value.phone}
            onChange={e => onChange({ ...value, phone: e.target.value })}
          />
        </div>
        <select
          className="w-full border border-[#2A2A40] rounded bg-[#1A1A2E] px-3 py-2 outline-none text-white focus:ring-2 focus:ring-[#00FFFF]/30"
          value={value.province}
          onChange={e => {
            const code = e.target.value;
            const provinceObj = provinces.find(p => p.code === code);
            onChange({
              ...value,
              province: code,
              provinceName: provinceObj ? provinceObj.name : e.target.options[e.target.selectedIndex].text,
              district: "",
              districtName: "",
            });
          }}
        >
          <option value="">Tỉnh/Thành phố</option>
          {loadingProvinces ? (
            <option disabled>Đang tải...</option>
          ) : (
            provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))
          )}
        </select>
        <select
          className="w-full border border-[#2A2A40] rounded bg-[#1A1A2E] px-3 py-2 outline-none text-white focus:ring-2 focus:ring-[#00FFFF]/30"
          value={value.district}
          onChange={e => {
            const code = e.target.value;
            const districtObj = districts.find(d => d.code === code);
            onChange({
              ...value,
              district: code,
              districtName: districtObj ? districtObj.name : e.target.options[e.target.selectedIndex].text,
            });
          }}
          disabled={!value.province || loadingDistricts}
        >
          <option value="">Quận/Huyện</option>
          {loadingDistricts ? (
            <option disabled>Đang tải...</option>
          ) : (
            districts.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))
          )}
        </select>
        <input
          type="text"
          placeholder="Tòa nhà, Tên đường..."
          className="w-full border border-[#2A2A40] rounded bg-[#1A1A2E] px-3 py-2 outline-none text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#00FFFF]/30"
          value={value.address}
          onChange={e => onChange({ ...value, address: e.target.value })}
        />
      </div>
    </div>
  );
} 