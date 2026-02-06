// src/pages/AuthPage.tsx
import React, { useState } from "react";
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

const InscriptionEtudiant = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    region: "",
    rentree: "",
    email: "",
    password: "",
  });

  const regions = ["Antananarivo"];
  const rentrees = ["V01", "V02", "V03", "V04"];
  const salles = [
    "Besarety",
    "Saint Etienne",
    "Miandrarivo",
    "Miandrarivo 2",
    "Volosarika",
    "Volosarika 2",
  ];
  const shift = ["06h-07h30", "07h30-09h", "09h-10h30", "10h-12h"];

  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleSignupChange = (e) =>
    setSignupData({ ...signupData, [e.target.name]: e.target.value });

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Connexion avec :", loginData);
    alert("Connexion réussie ! (simulation)");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (
      !signupData.nom ||
      !signupData.prenom ||
      !signupData.email ||
      !signupData.password
    ) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }
    console.log("Inscription :", signupData);
    alert("Inscription enregistrée ! (simulation)");
  };

  const handleGoogle = () => {
    alert("Connexion avec Google (à implémenter)");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 overflow-hidden relative">
      {/* Bouton retour - TOUJOURS VISIBLE */}
      {/* <button
        onClick={() => window.history.back()}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-md hover:bg-white transition-all text-primary font-medium border border-gray-200 cursor-pointer"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Retour</span>
      </button> */}

      {/* Conteneur principal limité en hauteur */}
      <div className="relative h-screen max-h-screen flex overflow-hidden">
        {/* Partie gauche - FIXÉE */}
        <div className="hidden lg:block lg:w-1/2 fixed inset-y-0 left-0 z-10 bg-linear-to-br from-[#0a3d5c]/10 to-blue-50">
          <div className="h-full flex flex-col justify-center items-center p-12">
            <div className="max-w-md text-center">
              <div className="flex items-center justify-center mb-8 w-100 h-60 rounded-full overflow-hidden mx-auto ">
                <img src="/blessing-school.png" alt="blessing school" />
              </div>

              <div className="space-y-6 text-left max-w-sm mx-auto">
                <div className="flex items-start gap-4 text-lg text-gray-800">
                  <div className="w-10 h-10 rounded-full bg-[#0a3d5c]/10 flex items-center justify-center shrink-0 mt-1">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <span>Éducation de qualité accessible à tous</span>
                </div>
                <div className="flex items-start gap-4 text-lg text-gray-800">
                  <div className="w-10 h-10 rounded-full bg-[#0a3d5c]/10 flex items-center justify-center shrink-0 mt-1">
                    <User size={20} className="text-primary" />
                  </div>
                  <span>Apprentissage adapté au contexte malgache</span>
                </div>
                <div className="flex items-start gap-4 text-lg text-gray-800">
                  <div className="w-10 h-10 rounded-full bg-[#0a3d5c]/10 flex items-center justify-center shrink-0 mt-1">
                    <Mail size={20} className="text-primary" />
                  </div>
                  <span>Accompagnement personnalisé et continu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partie droite - SCROLLABLE avec effet de transition */}
        <div className="w-full lg:ml-[50%] lg:w-1/2 h-screen overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-md py-12 transition-all duration-500 ease-in-out">
              {/* Titre avec animation */}
              <div
                className={`text-center mb-8 transform transition-all duration-500 ${isLogin ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-90"}`}
              >
                <h2 className="text-3xl font-bold text-primary">
                  {isLogin ? "Bienvenue à nouveau !" : "Crée ton compte"}
                </h2>
                <p className="text-gray-600 mt-3 transition-all duration-500">
                  {isLogin
                    ? "Connecte-toi pour reprendre ton apprentissage"
                    : "Rejoins la communauté Blessing School dès aujourd'hui"}
                </p>
              </div>

              {/* Switch avec animation */}
              <div className="flex mb-10 bg-gray-100 rounded-full p-1.5 shadow-inner transition-all duration-500">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 rounded-full font-medium transition-all duration-300 ${
                    isLogin
                      ? "bg-white shadow-md scale-105 text-primary"
                      : "text-gray-600 hover:text-primary scale-100 cursor-pointer"
                  }`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 rounded-full font-medium transition-all duration-300 ${
                    !isLogin
                      ? "bg-white shadow-md scale-105 text-primary"
                      : "text-gray-600 hover:text-primary scale-100 cursor-pointer"
                  }`}
                >
                  Inscription
                </button>
              </div>

              {/* Formulaire avec effet de fondu */}
              <div
                className={`transition-all duration-500 ease-in-out transform ${
                  isLogin
                    ? "opacity-100 translate-y-0"
                    : "opacity-90 -translate-y-5"
                }`}
              >
                <form
                  onSubmit={isLogin ? handleLogin : handleSignup}
                  className="space-y-6"
                >
                  {!isLogin && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prénom
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            value={signupData.prenom}
                            onChange={handleSignupChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0a3d5c] focus:ring-2 focus:ring-[#0a3d5c]/20 outline-none transition"
                            placeholder="Ton prénom"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom
                          </label>
                          <input
                            type="text"
                            name="nom"
                            value={signupData.nom}
                            onChange={handleSignupChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0a3d5c] focus:ring-2 focus:ring-[#0a3d5c]/20 outline-none transition"
                            placeholder="Ton nom"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          name="telephone"
                          value={signupData.telephone}
                          onChange={handleSignupChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0a3d5c] focus:ring-2 focus:ring-[#0a3d5c]/20 outline-none transition"
                          placeholder="+261 34 00 000 00"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={isLogin ? loginData.email : signupData.email}
                      onChange={
                        isLogin ? handleLoginChange : handleSignupChange
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0a3d5c] focus:ring-2 focus:ring-[#0a3d5c]/20 outline-none transition"
                      placeholder="ton@email.com"
                      required
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={isLogin ? loginData.password : signupData.password}
                      onChange={
                        isLogin ? handleLoginChange : handleSignupChange
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0a3d5c] focus:ring-2 focus:ring-[#0a3d5c]/20 outline-none transition pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-10 text-gray-500 hover:text-primary transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {!isLogin && (
                    <>
                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="region"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            Région
                          </label>
                          <div className="relative group">
                            <select
                              id="region"
                              name="region"
                              value={signupData.region}
                              onChange={handleSignupChange}
                              className={`
                                w-full px-4 py-3.5
                                border border-gray-300 
                                rounded-xl shadow-sm
                                text-gray-900
                                focus:border-[#0a3d5c] focus:ring-2 focus:ring-[#0a3d5c]/30 focus:shadow-md
                                hover:border-gray-400
                                transition-all duration-200
                                appearance-none cursor-pointer
                              `}
                            >
                              {regions.length > 0 && (
                                <>
                                  <option value={regions[0]}>
                                    {regions[0]}
                                  </option>
                                  {regions.slice(1).map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                </>
                              )}
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                              <svg
                                className="h-5 w-5 text-gray-500 group-focus-within:text-[#0a3d5c] group-focus-within:rotate-180 transition-all duration-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="salle"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            Salle
                          </label>
                          <div className="relative group">
                            <select
                              id="salle"
                              name="salle"
                              value={signupData.salle ?? ""}
                              onChange={handleSignupChange}
                              required
                              className={`
                                w-full px-4 py-3.5
                                border border-gray-300 
                                rounded-xl shadow-sm
                                text-gray-900
                                focus:border-[#0a3d5c] focus:ring-2 focus:ring-[#0a3d5c]/30 focus:shadow-md
                                hover:border-gray-400
                                transition-all duration-200
                                appearance-none cursor-pointer
                              `}
                            >
                              {salles.length > 0 && (
                                <>
                                  <option value={salles[0]}>{salles[0]}</option>
                                  {salles.slice(1).map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </>
                              )}
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                              <svg
                                className="h-5 w-5 text-gray-500 group-focus-within:text-[#0a3d5c] group-focus-within:rotate-180 transition-all duration-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="rentree"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            Rentrée scolaire
                          </label>
                          <div className="relative group">
                            <select
                              id="rentree"
                              name="rentree"
                              value={signupData.rentree}
                              onChange={handleSignupChange}
                              required
                              className={`
                                w-full px-4 py-3.5
                                border border-gray-300 
                                rounded-xl shadow-sm
                                text-gray-900
                                focus:border-[#0a3d5c] focus:ring-2 focus:ring-[#0a3d5c]/30 focus:shadow-md
                                hover:border-gray-400
                                transition-all duration-200
                                appearance-none cursor-pointer
                              `}
                            >
                              {rentrees.length > 0 && (
                                <>
                                  <option value={rentrees[0]}>
                                    {rentrees[0]}
                                  </option>
                                  {rentrees.slice(1).map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                </>
                              )}
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                              <svg
                                className="h-5 w-5 text-gray-500 group-focus-within:text-[#0a3d5c] group-focus-within:rotate-180 transition-all duration-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="rentree"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                          >
                            Shift
                          </label>
                          <div className="relative group">
                            <select
                              id="shift"
                              name="shift"
                              value={signupData.shift}
                              onChange={handleSignupChange}
                              required
                              className={`
                                w-full px-4 py-3.5
                                border border-gray-300 
                                rounded-xl shadow-sm
                                text-gray-900
                                focus:border-[#0a3d5c] focus:ring-2 focus:ring-[#0a3d5c]/30 focus:shadow-md
                                hover:border-gray-400
                                transition-all duration-200
                                appearance-none cursor-pointer
                              `}
                            >
                              {shift.length > 0 && (
                                <>
                                  <option value={shift[0]}>
                                    {shift[0]}
                                  </option>
                                  {shift.slice(1).map((heure) => (
                                    <option key={heure} value={heure}>
                                      {heure}
                                    </option>
                                  ))}
                                </>
                              )}
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                              <svg
                                className="h-5 w-5 text-gray-500 group-focus-within:text-[#0a3d5c] group-focus-within:rotate-180 transition-all duration-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 bg-linear-to-r from-[#0a3d5c] to-blue-900 hover:from-blue-900 hover:to-[#0a3d5c] text-white font-bold rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 mt-6 cursor-pointer"
                  >
                    {isLogin ? "Se connecter" : "S'inscrire"}
                  </button>
                </form>
              </div>

              {/* Google + liens */}
              <div
                className={`mt-10 transition-all duration-700 ${isLogin ? "opacity-100" : "opacity-90"}`}
              >
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gray-100 rounded-full px-4 text-sm text-gray-500">
                      OU
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 hover:border-[#0a3d5c] text-primary font-semibold py-4 rounded-xl transition-all duration-300 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="hidden xs:inline">
                    Continuer avec Google
                  </span>
                  <span className="xs:hidden">Google</span>
                </button>

                <div className="mt-8 text-center text-sm text-gray-600">
                  {isLogin ? (
                    <>
                      Pas encore de compte ?{" "}
                      <button
                        onClick={() => setIsLogin(false)}
                        className="text-primary font-medium hover:underline cursor-pointer"
                      >
                        S'inscrire
                      </button>
                    </>
                  ) : (
                    <>
                      Déjà inscrit ?{" "}
                      <button
                        onClick={() => setIsLogin(true)}
                        className="text-primary font-medium hover:underline cursor-pointer"
                      >
                        Se connecter
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InscriptionEtudiant;
