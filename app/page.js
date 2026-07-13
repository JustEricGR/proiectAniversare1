'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ClientPage() {
  const [settings, setSettings] = useState(null);
  const [buttons, setButtons] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, main_menu, button_detail
  const [selectedButton, setSelectedButton] = useState(null);
  const [buttonContent, setButtonContent] = useState(null);

  // Încărcăm setările globale și butoanele
  useEffect(() => {
    async function fetchData() {
      const { data: settingsData } = await supabase.from('site_settings').select('*').single();
      const { data: buttonsData } = await supabase.from('main_buttons').select('*').order('position', { ascending: true });
      
      if (settingsData) setSettings(settingsData);
      if (buttonsData) setButtons(buttonsData);
    }
    fetchData();
  }, []);

  // Încărcăm conținutul când un buton este selectat
  const handleButtonClick = async (btn) => {
    setSelectedButton(btn);
    const { data } = await supabase.from('button_content').select('*').eq('button_id', btn.id).single();
    setButtonContent(data || { image_urls: [], custom_text: '', youtube_url: '' });
    setCurrentScreen('button_detail');
  };

  if (!settings) return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Se încarcă...</div>;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-between p-6 relative transition-all duration-500"
      style={{ backgroundImage: `url(${settings.background_image_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809'})` }}
    >
      {/* Overlay pentru lizibilitate */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      {/* Header */}
      <header className="z-10 text-center pt-8">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md tracking-wider">
          {settings.client_title || "Site-ul Meu Personalizat"}
        </h1>
      </header>

      {/* Main Content Areas */}
      <main className="z-10 flex-grow flex items-center justify-center my-8 max-w-4xl mx-auto w-full">
        
        {/* ECRAN 1: Welcome Screen */}
        {currentScreen === 'welcome' && (
          <button 
            onClick={() => setCurrentScreen('main_menu')}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-2xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition active:scale-95"
          >
            {settings.client_button_text || "Intră în Meniu"}
          </button>
        )}

        {/* ECRAN 2: Meniul Principal (Butoane mari configurate de Admin) */}
        {currentScreen === 'main_menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
            {buttons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleButtonClick(btn)}
                className="p-8 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white text-xl font-semibold rounded-2xl shadow-lg transition transform hover:-translate-y-1 text-center"
              >
                {btn.label}
              </button>
            ))}
            {buttons.length === 0 && <p className="text-white text-center col-span-full">Niciun buton configurat momentan.</p>}
          </div>
        )}

        {/* ECRAN 3: Detalii Buton (Poze + Text + YouTube) */}
        {currentScreen === 'button_detail' && buttonContent && (
          <div className="w-full bg-black/60 backdrop-blur-lg p-6 rounded-3xl text-white space-y-6 max-h-[75vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-center border-b border-white/20 pb-4">{selectedButton?.label}</h2>
            
            {buttonContent.custom_text && (
              <p className="text-lg bg-white/5 p-4 rounded-xl whitespace-pre-line leading-relaxed">{buttonContent.custom_text}</p>
            )}

            {/* Galerie de Imagini */}
            {buttonContent.image_urls?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {buttonContent.image_urls.map((url, idx) => (
                  <img key={idx} src={url} alt={`Content ${idx}`} className="w-full h-48 object-cover rounded-xl shadow-md border border-white/10" />
                ))}
              </div>
            )}

            {/* Player YouTube Video/Audio */}
            {buttonContent.youtube_url && (
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-xl">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeId(buttonContent.youtube_url)}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer cu Butonul de întoarcere cerut */}
      <footer className="z-10 flex justify-center pb-6">
        {currentScreen !== 'welcome' && (
          <button 
            onClick={() => setCurrentScreen('main_menu')}
            className="px-6 py-2 bg-white text-black hover:bg-gray-200 font-medium rounded-full shadow-md transition"
          >
            Meniu Principal
          </button>
        )}
      </footer>
    </div>
  );
}

// Funcție ajutătoare pentru extragerea ID-ului de YouTube
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}