'use client';

import React, { useEffect, useState } from 'react';
import { ChefHat, Calendar, Users, TrendingUp, AlertTriangle, ChevronLeft, ChevronRight, FileText, Plus, Bell, Phone, UserSearch, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StudentData {
  id: string;
  name: string;
  course: string;
  attendanceRate: number;
}

export default function AttendanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [studentsAtRisk, setStudentsAtRisk] = useState<StudentData[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);

  useEffect(() => {
    // In a real application, we would fetch from /sejong/data/members.json and attendance.json
    const fetchSimulatedData = async () => {
      try {
        const membersRes = await fetch('/sejong/data/members.json');
        let total = 412; // fallback
        if (membersRes.ok) {
          const members = await membersRes.json();
          const studentKeys = Object.keys(members).filter(k => k !== 'meta' && k !== 'test');
          if (studentKeys.length > 0) total = studentKeys.length;
        }
        setTotalStudents(total);
        setAvgAttendance(94.2);

        // Simulated at-risk students with a bit more detail
        setStudentsAtRisk([
          { id: '1', name: '김지현', course: '제과제빵 기능사 (오전반)', attendanceRate: 76 },
          { id: '2', name: '박태환', course: '한식 조리 실무 (오후반)', attendanceRate: 78 },
          { id: '3', name: '이수민', course: '카페 디저트 마스터과정', attendanceRate: 79 },
          { id: '4', name: '최동원', course: '서양 요리 기초 (저녁반)', attendanceRate: 77 },
          { id: '5', name: '정유진', course: '제과제빵 기능사 (주말반)', attendanceRate: 72 },
          { id: '6', name: '강현수', course: '일식 조리 실무 (오전반)', attendanceRate: 75 },
        ]);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    fetchSimulatedData();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-lg font-light tracking-widest">대시보드 불러오는 중...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-4 md:p-8 font-sans" style={{ backgroundImage: 'radial-gradient(circle at top right, #1e293b 0%, #020617 100%)' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <ChefHat className="text-emerald-400" size={36} />
            세종요리제과기술학원
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-amber-500 mt-2 tracking-wide">원장님 전용 대시보드</h2>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right hidden md:block">
            <p className="text-sm text-slate-400">최고 관리자</p>
            <p className="font-semibold text-white text-lg">오재을 원장님</p>
          </div>
          <div className="relative w-12 h-12 bg-slate-800 rounded-full border-2 border-emerald-500 flex items-center justify-center text-white overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Users size={24} />
          </div>
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell size={26} />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Stats & Chart */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Stat 1 */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] cursor-default">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:scale-110 transform">
                <TrendingUp size={64} className="text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">전체 출석률</p>
              <div className="flex items-end gap-3 mb-2">
                <h3 className="text-5xl font-light text-white tracking-tight">{avgAttendance}%</h3>
                <span className="text-sm font-bold text-emerald-400 flex items-center mb-2 bg-emerald-400/10 px-2 py-1 rounded-lg">▲ +1.8%</span>
              </div>
              <p className="text-sm text-slate-500">현재 등록된 총 수강생 <strong className="text-slate-300">{totalStudents}명</strong></p>
            </div>

            {/* Stat 2 */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] cursor-default">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">진행중인 과정</p>
              <div className="flex justify-between items-end mt-6">
                <div>
                  <h3 className="text-4xl font-light text-white">24</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">개 과정</p>
                </div>
                <div>
                  <h3 className="text-4xl font-light text-white">32</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">명 강사</p>
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <Link href="/sejong/attendance_manager.html" className="block bg-gradient-to-br from-red-950/40 to-slate-900/50 backdrop-blur-md border border-red-700/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]">
               <p className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 flex justify-between items-center">
                 출석 위험군 학생
                 <ArrowRight size={18} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 transform duration-300" />
               </p>
               <h3 className="text-5xl font-light text-white mt-2 group-hover:text-red-400 transition-colors">{studentsAtRisk.length}</h3>
               <p className="text-sm text-slate-400 mt-2 font-medium bg-red-500/10 inline-block px-2 py-1 rounded-md text-red-300">(출석률 80% 미만)</p>
               
               {/* Decorative mini chart line */}
               <div className="absolute bottom-0 left-0 w-full h-16 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                  <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full stroke-red-500 fill-none" strokeWidth="2">
                     <path d="M0,20 Q10,25 20,15 T40,25 T60,10 T80,20 T100,5" className="animate-[dash_3s_linear_infinite]" strokeDasharray="100" strokeDashoffset="0" />
                  </svg>
               </div>
            </Link>
          </div>

          {/* Main Chart Area */}
          <div className="bg-slate-900/40 backdrop-blur-lg border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-base font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Calendar size={18} className="text-emerald-400" />
                2026년 월별 출석 현황
              </h3>
              <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-800/80 px-4 py-2 rounded-full cursor-pointer hover:bg-slate-700 hover:text-white transition-all shadow-inner">
                <ChevronLeft size={16} />
                <span className="font-semibold">1월 - 12월</span>
                <ChevronRight size={16} />
              </div>
            </div>
            
            {/* Simulated Chart */}
            <div className="relative h-72 w-full mt-4">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[10, 8, 6, 4, 2, 0].map(val => (
                  <div key={val} className="flex items-center w-full border-t border-slate-700/40 h-0">
                    <span className="text-xs font-semibold text-slate-500 absolute left-0 -mt-2.5 bg-slate-950/80 pr-3">{val}k</span>
                  </div>
                ))}
              </div>
              
              {/* SVG Area Chart */}
              <div className="absolute inset-0 pl-10 pb-8">
                <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="glow">
                       <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                       <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                       </feMerge>
                    </filter>
                  </defs>
                  
                  {/* The Area */}
                  <path d="M0,180 C100,100 200,150 300,50 C400,120 500,140 600,40 C700,100 800,130 900,20 C1000,10 1000,10 1000,10 L1000,200 L0,200 Z" 
                        fill="url(#gradientArea)" className="transition-all duration-1000" />
                  
                  {/* The Line */}
                  <path d="M0,180 C100,100 200,150 300,50 C400,120 500,140 600,40 C700,100 800,130 900,20 L1000,10" 
                        fill="none" 
                        stroke="#34d399" 
                        strokeWidth="4"
                        filter="url(#glow)" />
                  
                  {/* Data Points */}
                  <circle cx="300" cy="50" r="6" fill="#0f172a" stroke="#34d399" strokeWidth="3" className="hover:r-8 hover:fill-emerald-400 transition-all cursor-pointer" />
                  <circle cx="600" cy="40" r="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" className="hover:r-8 hover:fill-amber-400 transition-all cursor-pointer" />
                  <circle cx="900" cy="20" r="6" fill="#0f172a" stroke="#34d399" strokeWidth="3" className="hover:r-8 hover:fill-emerald-400 transition-all cursor-pointer" />
                </svg>
                
                {/* Labels */}
                <div className="absolute top-[35px] left-[30%] -translate-x-1/2 -translate-y-full text-center bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-600/50 shadow-lg">
                   <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">4월</p>
                   <p className="text-white text-sm font-semibold">8,240명</p>
                </div>
                <div className="absolute top-[25px] left-[60%] -translate-x-1/2 -translate-y-full text-center bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-600/50 shadow-lg">
                   <p className="text-amber-400 text-xs font-bold uppercase tracking-wider">8월</p>
                   <p className="text-white text-sm font-semibold">9,105명</p>
                </div>
                <div className="absolute top-[5px] left-[90%] -translate-x-1/2 -translate-y-full text-center bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-600/50 shadow-lg">
                   <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">11월</p>
                   <p className="text-white text-sm font-semibold">9,720명</p>
                </div>
              </div>
              
              {/* X Axis Labels */}
              <div className="absolute bottom-0 left-10 right-0 flex justify-between text-sm font-medium text-slate-500 pt-3 border-t border-slate-700/60">
                <span>3월</span>
                <span>4월</span>
                <span>5월</span>
                <span>6월</span>
                <span>7월</span>
                <span>8월</span>
                <span>9월</span>
                <span>10월</span>
                <span>11월</span>
                <span>12월</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Quick Actions */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-lg">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5">빠른 실행 메뉴</h3>
               <div className="grid grid-cols-3 gap-4">
                  <a href="/sejong/class_days_admin.html" className="flex flex-col items-center justify-center p-4 bg-slate-800/60 rounded-xl hover:bg-slate-700/90 transition-all duration-300 border border-slate-600/40 hover:border-emerald-500/50 group shadow-md hover:shadow-lg hover:-translate-y-1">
                    <Calendar className="text-emerald-400 mb-3 group-hover:scale-125 transition-transform duration-300" size={28} />
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">시간표</span>
                  </a>
                  <a href="/sejong/stats.html" className="flex flex-col items-center justify-center p-4 bg-slate-800/60 rounded-xl hover:bg-slate-700/90 transition-all duration-300 border border-slate-600/40 hover:border-blue-500/50 group shadow-md hover:shadow-lg hover:-translate-y-1">
                    <FileText className="text-blue-400 mb-3 group-hover:scale-125 transition-transform duration-300" size={28} />
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">보고서</span>
                  </a>
                  <a href="/sejong/course_time_admin.html" className="flex flex-col items-center justify-center p-4 bg-slate-800/60 rounded-xl hover:bg-emerald-900/60 transition-all duration-300 border border-emerald-500/30 hover:border-emerald-400 group shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:-translate-y-1">
                    <Plus className="text-emerald-400 mb-3 group-hover:scale-125 transition-transform duration-300 group-hover:rotate-90" size={28} />
                    <span className="text-sm font-bold text-emerald-400">과정 개설</span>
                  </a>
               </div>
            </div>
            
            {/* Upcoming Events */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-lg">
               <div className="flex justify-between items-center mb-5">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">학사 주요 일정</h3>
                 <a href="/sejong/admin.html" className="text-xs text-blue-400 hover:text-blue-300 font-medium">전체보기</a>
               </div>
               <div className="space-y-4">
                 <div className="flex items-center gap-4 bg-slate-800/50 hover:bg-slate-800/80 transition-colors cursor-pointer p-4 rounded-xl border border-slate-700/40 group">
                   <div className="bg-slate-950 p-2 rounded-lg text-center min-w-[55px] border border-slate-800 group-hover:border-blue-500/50 transition-colors">
                     <p className="text-[11px] font-bold text-slate-400 uppercase">10월</p>
                     <p className="text-lg font-black text-white mt-0.5">12</p>
                   </div>
                   <div>
                     <p className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">제과 명장 초청 특강</p>
                     <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><Users size={14}/> 본관 대강당 (14:00)</p>
                   </div>
                 </div>
               </div>
            </div>

          </div>

        </div>

        {/* Right Column - Alert Panel */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-red-900/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative max-h-[900px]">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
           <div className="p-7 border-b border-slate-800/80 flex justify-between items-center shrink-0 bg-slate-900/50">
             <div>
               <h3 className="text-base font-extrabold text-white tracking-wide">출석 위험군 학생</h3>
               <p className="text-sm font-medium text-slate-400 mt-1">(출석률 80% 미만)</p>
             </div>
             <div className="bg-red-500/10 p-3 rounded-full border border-red-500/20">
               <AlertTriangle className="text-red-500" size={28} />
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #0f172a' }}>
             {studentsAtRisk.map((student, i) => (
               <div key={student.id} className="bg-slate-800/40 hover:bg-slate-800/90 transition-all duration-300 p-5 rounded-2xl border border-slate-700/50 hover:border-slate-600 flex flex-col gap-4 shadow-sm hover:shadow-md">
                 <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white text-lg font-bold border border-slate-600 shadow-inner">
                       {student.name.charAt(0)}
                     </div>
                     <div>
                       <p className="text-base font-bold text-white tracking-wide">{student.name}</p>
                       <p className="text-sm text-slate-400 mt-0.5">{student.course}</p>
                     </div>
                   </div>
                   <div className="flex flex-col items-end">
                     <span className={`font-black text-lg px-2.5 py-1 rounded-lg ${student.attendanceRate < 75 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                       {student.attendanceRate}%
                     </span>
                   </div>
                 </div>
                 
                 <div className="flex gap-3 mt-2">
                   {/* Call Action - Navigates to SMS page or opens link */}
                   <a href={`/sejong/sms.html?name=${encodeURIComponent(student.name)}`} className="flex-1 bg-slate-700/40 hover:bg-emerald-600/90 text-emerald-100 hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] flex justify-center items-center gap-2">
                     <Phone size={16} />
                     연락하기
                   </a>
                   {/* Detail Action - Navigates to Student Search */}
                   <a href={`/sejong/index.html?search=${encodeURIComponent(student.name)}`} className="flex-1 bg-slate-700/40 hover:bg-blue-600/90 text-blue-100 hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 border border-blue-500/20 hover:border-blue-500 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] flex justify-center items-center gap-2">
                     <UserSearch size={16} />
                     상세보기
                   </a>
                 </div>
               </div>
             ))}
           </div>
           
           <div className="p-5 border-t border-slate-800/80 shrink-0 bg-slate-900/50">
             <a href="/sejong/attendance_manager.html" className="flex items-center justify-center gap-2 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold tracking-wide rounded-xl transition-all duration-300 border border-slate-600 hover:border-slate-500 shadow-md">
               위험군 전체 목록 보기
               <ArrowRight size={18} />
             </a>
           </div>
        </div>

      </div>
    </div>
  );
}
