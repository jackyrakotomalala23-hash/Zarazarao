import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, MessageSquare, ShieldCheck, Heart, Sparkles, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface ContactPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('suggestion');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
    >
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full inline-block">
          Support & Partenariats Madagascar
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
          Contactez l'équipe Zarazarao
        </h1>
        <p className="text-sm text-gray-600">
          Suggestions, signalements, réclamations ou demandes de partenariat : notre équipe basée à Antananarivo est à votre écoute.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-gray-900">Coordonnées Officielles</h3>
            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>Analakely, Antananarivo 101, Madagascar</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-gray-900">+261 37 53 336 29</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-gray-900">zarazaraomada@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900 to-indigo-950 rounded-3xl p-6 text-white space-y-3 shadow-md">
            <Sparkles className="w-6 h-6 text-amber-300" />
            <h4 className="font-bold text-sm">Esprit Fihavanana</h4>
            <p className="text-xs text-emerald-100 leading-relaxed">
              « Ny fihavanana toy ny tady mitondra aina ». Ensemble, faisons grandir la solidarité et l'entraide partout à Madagascar.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
          {submitted ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl">
                ✨
              </div>
              <h3 className="text-xl font-black text-gray-900">Message bien envoyé !</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Misaotra betsaka ! Votre message a bien été transmis à l'équipe Zarazarao. Nous vous répondrons sous 24h ouvrées.
              </p>
              <button
                onClick={() => { setSubmitted(false); setMessage(''); }}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Envoyer un autre message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Objet de votre demande :</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="suggestion">💡 Suggestion d'amélioration</option>
                  <option value="reclamation">⚠️ Réclamation / Signalement d'abus</option>
                  <option value="partenariat">🤝 Demande de partenariat / Enseigne caisse</option>
                  <option value="autre"> autre demande générale</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Votre Nom / Prénom *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Mialy Rakoto"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Adresse Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mialy@exemple.mg"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Téléphone (Optionnel)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+261 34 00 000 00"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Votre message détaillé *</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre suggestion, signalement ou demande..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Envoi en cours...' : 'Envoyer le message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};
