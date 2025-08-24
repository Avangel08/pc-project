import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white pt-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] mb-4">Liên hệ với chúng tôi</h1>
        <p className="text-gray-300 mb-8">Bạn có câu hỏi, góp ý hoặc cần hỗ trợ? Hãy gửi thông tin cho chúng tôi, đội ngũ sẽ phản hồi sớm nhất!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Form liên hệ */}
          <form className="bg-[#161625] rounded-xl p-8 flex flex-col gap-4 border border-[#2A2A40] shadow-lg">
            <label className="flex flex-col gap-1">
              <span className="font-medium">Họ và tên</span>
              <input type="text" required placeholder="Nhập họ tên..." className="px-3 py-2 rounded bg-[#23234a] text-white border border-[#2A2A40] focus:outline-none focus:ring-2 focus:ring-[#00FFFF]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Email</span>
              <input type="email" required placeholder="Nhập email..." className="px-3 py-2 rounded bg-[#23234a] text-white border border-[#2A2A40] focus:outline-none focus:ring-2 focus:ring-[#00FFFF]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Số điện thoại</span>
              <input type="tel" placeholder="Nhập số điện thoại..." className="px-3 py-2 rounded bg-[#23234a] text-white border border-[#2A2A40] focus:outline-none focus:ring-2 focus:ring-[#00FFFF]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Nội dung</span>
              <textarea required rows={4} placeholder="Nhập nội dung liên hệ..." className="px-3 py-2 rounded bg-[#23234a] text-white border border-[#2A2A40] focus:outline-none focus:ring-2 focus:ring-[#00FFFF] resize-none" />
            </label>
            <button type="submit" className="mt-2 px-6 py-3 bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] text-black font-semibold rounded hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-shadow">Gửi liên hệ</button>
          </form>
          {/* Thông tin liên hệ & bản đồ */}
          <div className="flex flex-col gap-6 justify-between">
            <div className="bg-[#161625] rounded-xl p-6 border border-[#2A2A40]">
              <h2 className="text-xl font-bold mb-2 font-orbitron">Thông tin liên hệ</h2>
              <div className="mb-2 flex items-center gap-2"><span className="text-[#00FFFF]">🏢</span> Địa chỉ: 123 Đường Công Nghệ, Quận 1, TP.HCM</div>
              <div className="mb-2 flex items-center gap-2"><span className="text-[#9D00FF]">📧</span> Email: <a href="mailto:thanhndpt00045@gamil.com" className="hover:text-[#00FFFF]">thanhndpt00045@gamil.com</a></div>
              <div className="mb-2 flex items-center gap-2"><span className="text-[#00FF66]">📞</span> Hotline: <a href="tel:0123456789" className="hover:text-[#00FFFF]">0123 456 789</a></div>
              <div className="flex items-center gap-4 mt-4">
                <a href="#" className="hover:text-[#00FFFF]" title="Facebook"><Image src="/facebook.svg" alt="Facebook" width={28} height={28} /></a>
                <a href="#" className="hover:text-[#00FFFF]" title="Zalo"><Image src="/zalo.svg" alt="Zalo" width={28} height={28} /></a>
                <a href="#" className="hover:text-[#00FFFF]" title="Instagram"><Image src="/instagram.svg" alt="Instagram" width={28} height={28} /></a>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-[#2A2A40] shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.502234833635!2d106.7004233153347!3d10.77637369232239!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1c1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2zMTIzIMSQxrDhu51uZyBDw7RuZyBOZ2jhu4csIFF14bqtbiAxLCBUaOG7pyBDaMOtbmggTWluaCwgSOG7kyBDaMOtbmggTWluaCwgVMOibiBCw6xuaCBNaW5o!5e0!3m2!1svi!2s!4v1680000000000!5m2!1svi!2s"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ liên hệ"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 