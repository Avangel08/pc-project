import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white pt-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#9D00FF] mb-4">Giới thiệu về PC Store</h1>
        <p className="text-gray-300 mb-8">PC Store là hệ thống bán lẻ thiết bị chơi game, phụ kiện máy tính, anime figure và các sản phẩm công nghệ hàng đầu Việt Nam. Chúng tôi cam kết mang đến trải nghiệm mua sắm hiện đại, uy tín và tận tâm cho mọi khách hàng.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div className="flex flex-col gap-6 justify-center">
            <div>
              <h2 className="text-xl font-bold mb-2 font-orbitron">Sứ mệnh</h2>
              <p className="text-gray-300">Kết nối đam mê công nghệ, nâng tầm trải nghiệm game và sáng tạo cho cộng đồng Việt Nam.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2 font-orbitron">Giá trị cốt lõi</h2>
              <ul className="list-disc pl-5 text-gray-300 space-y-1">
                <li>Khách hàng là trung tâm</li>
                <li>Chất lượng sản phẩm & dịch vụ</li>
                <li>Đổi mới & sáng tạo</li>
                <li>Chia sẻ cộng đồng</li>
                <li>Trách nhiệm & minh bạch</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image src="/about-hero.png" alt="PC Store" width={350} height={350} className="rounded-xl shadow-lg object-contain bg-[#23234a]" />
          </div>
        </div>
        <div className="bg-[#161625] rounded-xl p-8 border border-[#2A2A40] mb-12">
          <h2 className="text-xl font-bold mb-4 font-orbitron">Lịch sử phát triển</h2>
          <ul className="list-disc pl-5 text-gray-300 space-y-1">
            <li><b>2018:</b> Thành lập cửa hàng đầu tiên tại TP.HCM</li>
            <li><b>2020:</b> Mở rộng hệ thống bán lẻ toàn quốc, ra mắt website thương mại điện tử</li>
            <li><b>2022:</b> Đạt mốc 100.000 khách hàng, đa dạng hóa sản phẩm gaming, anime, PC</li>
            <li><b>2024:</b> Tiếp tục phát triển, nâng cấp trải nghiệm khách hàng, mở rộng cộng đồng game thủ & sáng tạo</li>
          </ul>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div className="bg-[#161625] rounded-xl p-8 border border-[#2A2A40] flex flex-col gap-4">
            <h2 className="text-xl font-bold font-orbitron mb-2">Tại sao chọn PC Store?</h2>
            <ul className="list-disc pl-5 text-gray-300 space-y-1">
              <li>Sản phẩm chính hãng, bảo hành minh bạch</li>
              <li>Đội ngũ tư vấn tận tâm, am hiểu công nghệ</li>
              <li>Giao hàng nhanh, hỗ trợ đổi trả 7 ngày</li>
              <li>Ưu đãi thành viên, sự kiện cộng đồng hấp dẫn</li>
              <li>Hỗ trợ kỹ thuật trọn đời sản phẩm</li>
            </ul>
          </div>
          <div className="bg-[#161625] rounded-xl p-8 border border-[#2A2A40] flex flex-col gap-4">
            <h2 className="text-xl font-bold font-orbitron mb-2">Đội ngũ & Cam kết</h2>
            <ul className="list-disc pl-5 text-gray-300 space-y-1">
              <li>Đội ngũ trẻ trung, sáng tạo, chuyên nghiệp</li>
              <li>Luôn lắng nghe và đồng hành cùng khách hàng</li>
              <li>Cam kết chất lượng, uy tín và minh bạch</li>
              <li>Không ngừng đổi mới để phục vụ tốt hơn</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-400 text-sm mt-8">Cảm ơn bạn đã tin tưởng và đồng hành cùng PC Store!</div>
      </div>
    </div>
  );
} 