'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [settings, setSettings] = useState({ client_title: '', client_button_text: '', background_image_url: '' });
  const [buttons, setButtons] = useState([]);
  const [selectedButtonId, setSelectedButtonId] = useState('');
  const [content, setContent] = useState({ custom_text: '', youtube_url: '', image_urls: [] });
  
  const [newButtonLabel, setNewButtonLabel] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    const { data: settingsData } = await supabase.from('site_settings').select('*').single();
    const { data: buttonsData } = await supabase.from('main_buttons').select('*').order('position', { ascending: true });
    
    if (settingsData) setSettings(settingsData);
    if (buttonsData) {
      setButtons(buttonsData);
      if (buttonsData.length > 0 && !selectedButtonId) {
        setSelectedButtonId(buttonsData[0].id);
      }
    }
  }

  // Încărcăm conținutul butonului selectat în editor
  useEffect(() => {
    if (selectedButtonId) {
      supabase.from('button_content').select('*').eq('button_id', selectedButtonId).single()
        .then(({ data }) => {
          if (data) setContent(data);
          else setContent({ button_id: selectedButtonId, custom_text: '', youtube_url: '', image_urls: [] });
        });
    }
  }, [selectedButtonId]);

  const saveSettings = async () => {
    await supabase.from('site_settings').update(settings).eq('id', settings.id);
    alert('Setări globale salvate!');
  };

  const createButton = async () => {
    if (!newButtonLabel) return;
    const { data } = await supabase.from('main_buttons').insert([{ label: newButtonLabel, position: buttons.length + 1 }]).select();
    if (data) {
      setButtons([...buttons, data[0]]);
      setNewButtonLabel('');
      alert('Buton adăugat!');
    }
    fetchAdminData();
  };

  const saveContent = async () => {
    const { data: existing } = await supabase.from('button_content').select('id').eq('button_id', selectedButtonId).single();
    
    if (existing) {
      await supabase.from('button_content').update({
        custom_text: content.custom_text,
        youtube_url: content.youtube_url,
        image_urls: content.image_urls
      }).eq('button_id', selectedButtonId);
    } else {
      await supabase.from('button_content').insert([{
        button_id: selectedButtonId,
        custom_text: content.custom_text,
        youtube_url: content.youtube_url,
        image_urls: content.image_urls
      }]);
    }
    alert('Conținut buton salvat cu succes!');
  };

  const addImageToArray = () => {
    if (!newImageUrl) return;
    setContent({ ...content, image_urls: [...content.image_urls, newImageUrl] });
    setNewImageUrl('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 space-y-12">
      <h1 className="text-3xl font-bold border-b border-gray-700 pb-4">Panou de Administrare</h1>

      {/* Secțiunea 1: Setări Globale Ecran Start */}
      <section className="bg-gray-800 p-6 rounded-xl space-y-4 shadow-md">
        <h2 className="text-xl font-semibold text-purple-400">1. Configurare Ecran Start & Fundal</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" placeholder="Titlu Client" className="p-3 bg-gray-700 rounded-lg"
            value={settings.client_title} onChange={e => setSettings({...settings, client_title: e.target.value})}
          />
          <input 
            type="text" placeholder="Text Buton Start" className="p-3 bg-gray-700 rounded-lg"
            value={settings.client_button_text} onChange={e => setSettings({...settings, client_button_text: e.target.value})}
          />
          <input 
            type="text" placeholder="URL Imagine Fundal" className="p-3 bg-gray-700 rounded-lg"
            value={settings.background_image_url} onChange={e => setSettings({...settings, background_image_url: e.target.value})}
          />
        </div>
        <button onClick={saveSettings} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold">Salvează Fundal & Titlu</button>
      </section>

      {/* Secțiunea 2: Management Butoane Meniu */}
      <section className="bg-gray-800 p-6 rounded-xl space-y-4 shadow-md">
        <h2 className="text-xl font-semibold text-blue-400">2. Adăugare Butoane în Meniul Principal</h2>
        <div className="flex gap-4">
          <input 
            type="text" placeholder="Nume Buton Nou" className="p-3 bg-gray-700 rounded-lg flex-grow"
            value={newButtonLabel} onChange={e => setNewButtonLabel(e.target.value)}
          />
          <button onClick={createButton} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold">Adaugă Buton</button>
        </div>
      </section>

      {/* Secțiunea 3: Configurare Conținut pe Buton */}
      <section className="bg-gray-800 p-6 rounded-xl space-y-6 shadow-md">
        <h2 className="text-xl font-semibold text-green-400">3. Editare Conținut Buton (Imagini Multiple + YouTube)</h2>
        
        <div>
          <label className="block mb-2">Alege butonul pe care vrei să îl configurezi:</label>
          <select 
            className="p-3 bg-gray-700 rounded-lg w-full"
            value={selectedButtonId} onChange={e => setSelectedButtonId(e.target.value)}
          >
            {buttons.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-1">Text personalizat (Oricâte linii dorești):</label>
            <textarea 
              rows="4" className="p-3 bg-gray-700 rounded-lg w-full" placeholder="Scrie textul aici..."
              value={content.custom_text || ''} onChange={e => setContent({...content, custom_text: e.target.value})}
            />
          </div>

          <div>
            <label className="block mb-1">Link Melodie/Video YouTube:</label>
            <input 
              type="text" className="p-3 bg-gray-700 rounded-lg w-full" placeholder="https://www.youtube.com/watch?v=..."
              value={content.youtube_url || ''} onChange={e => setContent({...content, youtube_url: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block mb-1">Adaugă poze (Adaugă URL-ul imaginii):</label>
            <div className="flex gap-2">
              <input 
                type="text" className="p-3 bg-gray-700 rounded-lg flex-grow" placeholder="https://link-imagine.com/foto.jpg"
                value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
              />
              <button onClick={addImageToArray} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg">Adaugă URL</button>
            </div>
            
            {/* Listă provizorie URL-uri adăugate */}
            <div className="text-sm text-gray-400 space-y-1 bg-gray-900 p-3 rounded-lg max-h-32 overflow-y-auto">
              <p className="font-semibold text-gray-300">Imagini pregătite pentru salvare ({content.image_urls?.length || 0}):</p>
              {content.image_urls?.map((url, i) => (
                <div key={i} className="truncate select-all">{url}</div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={saveContent} className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg">
          Salvează tot conținutul pe acest buton
         </button>
      </section>
    </div>
  );
}