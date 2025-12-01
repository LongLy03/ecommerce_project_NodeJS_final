import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Terminal, Database, Server, Layout, Shield, Box, MonitorPlay, Info } from 'lucide-react';

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(true);

  const slides = [
    // --- OPENING ---
    {
      id: 0,
      section: "Intro",
      title: "BÁO CÁO FINAL PROJECT",
      subtitle: "Môn học: Lập trình Web với NodeJS",
      content: (
        <div className="flex flex-col items-center justify-center space-y-8 text-center h-full">
          <div className="p-8 bg-blue-100 rounded-full dark:bg-blue-900 shadow-lg">
            <Layout size={80} className="text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white leading-tight">Website Thương Mại Điện Tử<br/>(E-Commerce)</h2>
            <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mt-4">Xây dựng hệ thống Fullstack & Triển khai với Docker</p>
          </div>
        </div>
      ),
      notes: "Xin chào thầy và các bạn. Sau đây em xin trình bày về đồ án kết thúc môn. Đề tài em lựa chọn là xây dựng một hệ thống E-Commerce hoàn chỉnh, tập trung vào việc áp dụng NodeJS và quy trình đóng gói phần mềm hiện đại."
    },
    
    // --- PART 1: OVERVIEW ---
    {
      id: 1,
      section: "Phần 1: Tổng quan",
      title: "Mục Tiêu & Yêu Cầu Dự Án",
      icon: <Info size={36} className="text-blue-500" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-l-8 border-blue-500 flex flex-col justify-center h-full">
            <h3 className="text-2xl font-bold mb-6 text-blue-600 flex items-center"><Target size={24} className="mr-3"/> Mục Đích</h3>
            <ul className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="mr-3 text-blue-500">•</span> Xây dựng môi trường mua sắm trực tuyến.
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500">•</span> Quản lý sản phẩm & người dùng tập trung.
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-blue-500">•</span> Áp dụng kiến thức Fullstack NodeJS.
              </li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-l-8 border-green-500 flex flex-col justify-center h-full">
             <h3 className="text-2xl font-bold mb-6 text-green-600 flex items-center"><CheckCircle size={24} className="mr-3"/> Yêu Cầu Cốt Lõi</h3>
             <ul className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="mr-3 text-green-500">✓</span> Backend: NodeJS + Express.
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-green-500">✓</span> Database: MongoDB.
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-green-500">✓</span> Deployment: Docker Containerization.
              </li>
            </ul>
          </div>
        </div>
      ),
      notes: "Về tổng quan, dự án hướng tới việc tạo ra một trải nghiệm mua sắm liền mạch. Không chỉ dừng lại ở việc viết code, yêu cầu cốt lõi là phải đóng gói được sản phẩm để dễ dàng triển khai trên mọi môi trường nhờ Docker."
    },
    {
      id: 2,
      section: "Phần 1: Tổng quan",
      title: "Chức Năng Chính & Đối Tượng",
      icon: <Layout size={36} className="text-purple-500" />,
      content: (
        <div className="space-y-8 h-full flex flex-col justify-center">
          <div className="flex items-center space-x-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 p-4 rounded-full"><Layout className="text-purple-600" size={32} /></div>
            <div>
              <h3 className="font-bold text-2xl mb-2">Khách Hàng (User)</h3>
              <p className="text-lg opacity-80">Đăng ký, Đăng nhập, Xem sản phẩm, Giỏ hàng, Đặt hàng</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-red-100 p-4 rounded-full"><Shield className="text-red-600" size={32} /></div>
            <div>
              <h3 className="font-bold text-2xl mb-2">Quản Trị Viên (Admin)</h3>
              <p className="text-lg opacity-80">Quản lý Users, CRUD Sản phẩm & Danh mục, Thống kê, Import dữ liệu</p>
            </div>
          </div>

          <div className="mt-8 p-6 border-2 border-dashed border-yellow-400 rounded-2xl bg-yellow-50 dark:bg-gray-800 dark:border-yellow-600 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <AlertTriangle size={24} className="text-yellow-600 mr-3" />
              <span className="font-bold text-xl text-yellow-700 dark:text-yellow-500">Tài khoản Demo có sẵn:</span>
            </div>
            <code className="block bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow font-mono text-lg border border-gray-200 dark:border-gray-700">Admin: admin@gmail.com / Admin123@</code>
          </div>
        </div>
      ),
      notes: "Hệ thống phân chia rõ ràng 2 vai trò. User thực hiện các nghiệp vụ mua hàng cơ bản. Admin nắm quyền kiểm soát dữ liệu. Đặc biệt, để thuận tiện cho việc chấm bài, em đã tạo sẵn tài khoản Admin và User mặc định."
    },
    {
      id: 3,
      section: "Phần 1: Tổng quan",
      title: "Giải Pháp Triển Khai (Deployment)",
      icon: <Box size={36} className="text-orange-500" />,
      content: (
        <div className="flex flex-col items-center justify-center space-y-10 h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-center">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-blue-500">
              <Award size={40} className="text-blue-500 mx-auto mb-4" />
              <p className="font-extrabold text-3xl mb-2">1 Lệnh</p>
              <p className="text-lg text-gray-600 dark:text-gray-400">Khởi chạy duy nhất</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-green-500">
              <Layers size={40} className="text-green-500 mx-auto mb-4" />
              <p className="font-extrabold text-3xl mb-2">3 Services</p>
              <p className="text-lg text-gray-600 dark:text-gray-400">Web - API - DB</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-purple-500">
              <Database size={40} className="text-purple-500 mx-auto mb-4" />
              <p className="font-extrabold text-3xl mb-2">Auto Import</p>
              <p className="text-lg text-gray-600 dark:text-gray-400">Dữ liệu mẫu</p>
            </div>
          </div>
          
          <div className="w-full max-w-3xl bg-gray-900 text-green-400 p-8 rounded-2xl font-mono text-lg shadow-2xl border-l-8 border-green-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20"><Terminal size={64} /></div>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span className="flex items-center"><Terminal size={16} className="mr-2"/>TERMINAL</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-400 mr-2">$</span>
              <p className="typing-effect">docker-compose up -d --build</p>
            </div>
            <p className="text-gray-500 mt-4 text-base italic"># Đợi vài phút {'->'} Hệ thống sẵn sàng</p>
          </div>
        </div>
      ),
      notes: "Điểm sáng của dự án là quy trình triển khai 'One-click'. Thầy cô không cần cài Node, Mongo thủ công. Chỉ cần 1 lệnh docker-compose là toàn bộ hệ thống gồm API, Web và Database sẽ tự động dựng lên và kết nối với nhau."
    },

    // --- PART 2: TECH STACK ---
    {
      id: 4,
      section: "Phần 2: Công nghệ",
      title: "Tech Stack (Công Nghệ Sử Dụng)",
      icon: <Server size={36} className="text-green-600" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center">
          {/* Backend */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-t-8 border-green-500 hover:shadow-2xl transition-shadow">
            <div className="flex items-center mb-6 text-green-600">
              <Server className="mr-4" size={32} />
              <h3 className="font-bold text-2xl">Backend</h3>
            </div>
            <ul className="text-lg space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-center"><Code size={20} className="mr-3 text-green-500"/> <strong>Runtime:</strong> Node.js (v18+)</li>
              <li className="flex items-center"><Package size={20} className="mr-3 text-green-500"/> <strong>Framework:</strong> Express.js</li>
              <li className="flex items-center"><Database size={20} className="mr-3 text-green-500"/> <strong>ORM:</strong> Mongoose</li>
            </ul>
          </div>

          {/* Frontend */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-t-8 border-blue-500 hover:shadow-2xl transition-shadow">
             <div className="flex items-center mb-6 text-blue-600">
              <Layout className="mr-4" size={32} />
              <h3 className="font-bold text-2xl">Frontend</h3>
            </div>
            <ul className="text-lg space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-center"><Code size={20} className="mr-3 text-blue-500"/> <strong>Lib:</strong> ReactJS (Vue/Angular)</li>
              <li className="flex items-center"><ArrowLeftRight size={20} className="mr-3 text-blue-500"/> <strong>Call API:</strong> Fetch / Axios</li>
              <li className="flex items-center"><Layout size={20} className="mr-3 text-blue-500"/> <strong>UI:</strong> Component-based</li>
            </ul>
          </div>

           {/* Database & Auth */}
           <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-l-8 border-green-700 flex items-center hover:shadow-2xl transition-shadow">
               <div className="bg-green-100 p-4 rounded-full mr-6"><Database className="text-green-700" size={32} /></div>
               <div>
                 <h3 className="font-bold text-xl mb-2 text-green-700">Database</h3>
                 <p className="text-lg">MongoDB (NoSQL) chạy trên Docker Container</p>
               </div>
             </div>

             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-l-8 border-yellow-500 flex items-center hover:shadow-2xl transition-shadow">
               <div className="bg-yellow-100 p-4 rounded-full mr-6"><Shield className="text-yellow-600" size={32} /></div>
               <div>
                 <h3 className="font-bold text-xl mb-2 text-yellow-600">Security</h3>
                 <p className="text-lg">Xác thực người dùng bằng JSON Web Tokens (JWT)</p>
               </div>
             </div>
           </div>
        </div>
      ),
      notes: "Dự án sử dụng MERN Stack (hoặc biến thể). Backend viết bằng Express nhẹ nhàng nhưng mạnh mẽ. Database dùng MongoDB để lưu trữ dữ liệu dạng JSON linh hoạt. Frontend là React tương tác mượt mà với API."
    },
    {
      id: 5,
      section: "Phần 2: Công nghệ",
      title: "Hạ Tầng DevOps & Cấu Hình",
      icon: <Box size={36} className="text-indigo-600" />,
      content: (
        <div className="space-y-10 h-full flex flex-col justify-center">
          <div className="p-8 bg-indigo-50 dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-indigo-200 dark:border-indigo-800">
            <h3 className="font-bold text-2xl mb-6 flex items-center text-indigo-700 dark:text-indigo-400"><Box className="mr-4" size={28}/> Docker Compose Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow hover:shadow-md transition-shadow">
                <Server size={32} className="mx-auto mb-3 text-indigo-500" />
                <span className="block font-bold text-xl mb-1">backend</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">Dockerfile (Port 5000)</span>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow hover:shadow-md transition-shadow">
                 <Layout size={32} className="mx-auto mb-3 text-blue-500" />
                 <span className="block font-bold text-xl mb-1">frontend</span>
                 <span className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">Dockerfile (Port 3000)</span>
              </div>
              <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow hover:shadow-md transition-shadow">
                 <Database size={32} className="mx-auto mb-3 text-green-500" />
                 <span className="block font-bold text-xl mb-1">mongo-db</span>
                 <span className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">Image: mongo (Volume)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-50 dark:bg-gray-900 p-6 rounded-2xl border-l-8 border-red-500 shadow-md flex items-start">
                <AlertTriangle size={32} className="text-red-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-red-700 dark:text-red-400 text-lg uppercase mb-2">Lưu ý quan trọng</h4>
                  <p className="text-lg text-gray-700 dark:text-gray-300">File <code>mongo-init/import.sh</code> phải ở định dạng <strong>LF</strong> (Unix) để script chạy đúng trên Linux container.</p>
                </div>
            </div>
             <div className="bg-blue-50 dark:bg-gray-900 p-6 rounded-2xl border-l-8 border-blue-500 shadow-md flex items-start">
                <RefreshCw size={32} className="text-blue-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-700 dark:text-blue-400 text-lg uppercase mb-2">Reset Dữ liệu</h4>
                  <code className="text-base bg-white dark:bg-black px-3 py-1 rounded font-mono border border-blue-200 dark:border-blue-800">docker-compose down -v</code>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mt-3">Lệnh này giúp xóa sạch volume cũ để chấm lại từ đầu.</p>
                </div>
            </div>
          </div>
        </div>
      ),
      notes: "Để đảm bảo tính nhất quán, em sử dụng 3 containers riêng biệt. Một lưu ý nhỏ về kỹ thuật là file import script phải định dạng LF để chạy được trong môi trường Linux của Docker. Nếu cần reset dữ liệu, chỉ cần thêm cờ -v vào lệnh down."
    },
    {
      id: 6,
      section: "Phần 2: Công nghệ",
      title: "Demo & Kết Luận",
      icon: <MonitorPlay size={36} className="text-pink-600" />,
      content: (
        <div className="flex flex-col items-center justify-center space-y-10 h-full">
           <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
              <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-t-8 border-indigo-500 hover:-translate-y-2">
                <Layout size={48} className="mx-auto mb-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                <p className="text-gray-500 dark:text-gray-400 text-sm uppercase font-bold mb-2">Frontend Access</p>
                <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">localhost:3000</h3>
              </a>
              <a href="http://localhost:5000" target="_blank" rel="noopener noreferrer" className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-t-8 border-gray-500 hover:-translate-y-2">
                <Server size={48} className="mx-auto mb-4 text-gray-500 group-hover:scale-110 transition-transform" />
                <p className="text-gray-500 dark:text-gray-400 text-sm uppercase font-bold mb-2">Backend API</p>
                <h3 className="text-3xl font-bold text-gray-700 dark:text-gray-300 group-hover:underline">localhost:5000</h3>
              </a>
           </div>

           <div className="w-full max-w-3xl bg-gray-900 text-white p-8 rounded-2xl font-mono text-lg shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-20"><Terminal size={64} /></div>
             <div className="text-gray-500 mb-4 flex items-center"><Terminal size={16} className="mr-2"/>Xem logs gỡ lỗi realtime</div>
             <div className="flex items-center">
               <span className="text-blue-400 mr-2">$</span>
               <p>docker-compose logs -f</p>
             </div>
           </div>

           <div className="pt-8 text-center animate-fade-in">
             <h3 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-4">Cảm ơn thầy và các bạn đã lắng nghe!</h3>
             <p className="text-2xl text-gray-600 dark:text-gray-300 flex items-center justify-center"><MessageCircle size={24} className="mr-3" />Mời thầy và các bạn đặt câu hỏi.</p>
           </div>
        </div>
      ),
      notes: "Cuối cùng, sau khi chạy lệnh, hệ thống sẽ mở cổng 3000 cho Website và 5000 cho API. Chúng ta cũng có thể theo dõi logs thời gian thực để debug. Em xin kết thúc phần trình bày và chuyển sang phần Demo trực tiếp."
    }
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(curr => curr + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  // Import thêm các icon cần thiết
  const { Target, CheckCircle, AlertTriangle, Award, Layers, Code, Package, ArrowLeftRight, RefreshCw, MessageCircle } = require('lucide-react');


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black text-gray-800 dark:text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans transition-colors duration-300">
      
      {/* Slide Container */}
      <div className="w-full max-w-6xl aspect-[16/9] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col border border-gray-200 dark:border-gray-800">
        
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-4 md:p-6 flex justify-between items-center text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <Terminal size={28} className="text-blue-200" />
            <div>
              <span className="font-extrabold tracking-wider text-base md:text-lg uppercase opacity-90 block">Final Project</span>
              <span className="text-xs md:text-sm font-light opacity-80">Lập trình Web với NodeJS</span>
            </div>
          </div>
          <div className="text-sm md:text-base font-mono bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            Slide {currentSlide + 1} / {slides.length}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-start overflow-y-auto relative z-10">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          {/* Section Label */}
          {slides[currentSlide].section && (
            <div className="mb-4 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-sm md:text-base pl-2 border-l-4 border-blue-500 animate-fade-in-left">
              {slides[currentSlide].section}
            </div>
          )}
          
          {/* Title */}
          {slides[currentSlide].title && (
            <h1 className="text-3xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white flex items-center gap-4 animate-fade-in-down">
              {slides[currentSlide].icon}
              <span>{slides[currentSlide].title}</span>
            </h1>
          )}
          
          {/* Subtitle */}
          {slides[currentSlide].subtitle && (
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 font-light animate-fade-in-up delay-100">
              {slides[currentSlide].subtitle}
            </p>
          )}

          {/* Main Content Body */}
          <div className="mt-2 w-full h-full flex-1 animate-fade-in-up delay-200">
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Navigation Controls (Overlay) */}
        <button 
          onClick={prevSlide} 
          disabled={currentSlide === 0}
          className={`absolute left-6 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-md transition-all z-20 ${currentSlide === 0 ? 'opacity-0 cursor-default pointer-events-none' : 'opacity-70 hover:opacity-100 hover:scale-110'}`}
        >
          <ChevronLeft size={40} />
        </button>

        <button 
          onClick={nextSlide} 
          disabled={currentSlide === slides.length - 1}
          className={`absolute right-6 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-md transition-all z-20 ${currentSlide === slides.length - 1 ? 'opacity-0 cursor-default pointer-events-none' : 'opacity-70 hover:opacity-100 hover:scale-110'}`}
        >
          <ChevronRight size={40} />
        </button>
      </div>

      {/* Speaker Notes Section (Below Slide) */}
      <div className="w-full max-w-6xl mt-8 transition-all duration-500 ease-in-out">
        <div className="flex items-center justify-between mb-4">
           <button 
             onClick={() => setShowNotes(!showNotes)}
             className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none flex items-center transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow"
           >
             <Info size={20} className="mr-2"/>
             {showNotes ? 'Ẩn lời dẫn' : 'Hiện lời dẫn thuyết trình'}
           </button>
           <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow flex items-center">
             <MonitorPlay size={16} className="mr-2"/>
             Dùng phím mũi tên ⬅ ➡ để chuyển trang
           </span>
        </div>
        
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showNotes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-yellow-50 dark:bg-gray-800 border-l-8 border-yellow-400 p-6 rounded-2xl text-gray-800 dark:text-gray-200 text-lg shadow-md">
            <span className="font-bold block mb-3 text-yellow-700 dark:text-yellow-500 uppercase text-sm flex items-center"><MessageCircle size={18} className="mr-2"/> Speaker Notes (Gợi ý nói):</span>
            <p className="leading-relaxed">{slides[currentSlide].notes}</p>
          </div>
        </div>
      </div>

      {/* CSS for Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
        .animate-fade-in-left { animation: fade-in-left 0.5s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        
        .typing-effect {
          overflow: hidden;
          border-right: .15em solid orange;
          white-space: nowrap;
          margin: 0 auto;
          letter-spacing: .15em;
          animation: 
            typing 3.5s steps(40, end),
            blink-caret .75s step-end infinite;
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: orange; }
        }
      `}</style>

    </div>
  );
}