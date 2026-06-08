export type Language = 'tr' | 'en';

export const translations = {
  // Common / Sidebar
  brandName: { tr: 'DiaMate', en: 'DiaMate' },
  dashboardNav: { tr: 'Panel', en: 'Dashboard' },
  foodDbNav: { tr: 'Besin DB', en: 'Food DB' },
  settingsNav: { tr: 'Ayarlar', en: 'Settings' },
  
  // Dashboard
  dashboardTitle: { tr: 'Ana Panel', en: 'Dashboard' },
  estHbA1c: { tr: 'Tahmini HbA1c', en: 'Estimated HbA1c' },
  excellentRange: { tr: 'Mükemmel klinik aralık', en: 'Excellent clinical range' },
  latestGlucoseLabel: { tr: 'SON ÖLÇÜLEN GLİKOZ', en: 'LATEST GLUCOSE READING' },
  latestBadge: { tr: 'Son Ölçüm', en: 'Latest' },
  aiPredictiveTitle: { tr: 'YAPAY ZEKA ÖNGÖRÜSÜ', en: 'AI PREDICTIVE INSIGHT' },
  aiBlockSuffix: { tr: 'Bloku', en: 'Block' },
  expertAdviceTitle: { tr: 'UZMAN KLİNİK ÖNERİSİ', en: 'EXPERT CLINICAL ADVICE' },
  triggeredBy: { tr: 'Tetikleyen Besin:', en: 'Triggered by:' },
  proteinUnit: { tr: 'g Protein', en: 'g Protein' },
  fatUnit: { tr: 'g Yağ', en: 'g Fat' },
  tirTitle: { tr: 'Hedef Aralık Analizi (TIR)', en: 'Time in Range Analytics (TIR)' },
  tirSubtitle: { tr: 'Haftalık Hedef Aralığı (70 - 180 mg/dL)', en: 'Weekly Target Range (70 - 180 mg/dL)' },
  lowLabel: { tr: 'Düşük:', en: 'Low:' },
  safeLabel: { tr: 'Güvenli:', en: 'Safe:' },
  highLabel: { tr: 'Yüksek:', en: 'High:' },
  pastReadingsTitle: { tr: 'Geçmiş Ölçümler', en: 'Past Readings' },
  prevReadingsTitle: { tr: 'Önceki Ölçümler', en: 'Previous Readings' },
  emptyLogs: { tr: 'Henüz kayıtlı ölçüm yok.', en: 'No registered readings yet.' },
  trendRising: { tr: 'Yükseliş', en: 'Rising' },
  trendFalling: { tr: 'Düşüş', en: 'Falling' },
  trendStable: { tr: 'Stabil', en: 'Stable' },

  // Add Log Screen
  addLogTitle: { tr: 'Yeni Ölçüm Ekle', en: 'Add New Entry' },
  glucoseInputLabel: { tr: 'Kan Şekeri (mg/dL)', en: 'Blood Glucose (mg/dL)' },
  glucosePlaceholder: { tr: 'Örn: 120', en: 'e.g., 120' },
  nutritionSection: { tr: 'Besin Değerleri', en: 'Nutrition Facts' },
  carbsLabel: { tr: 'Karbonhidrat (gr)', en: 'Carbohydrates (g)' },
  carbsPlaceholder: { tr: 'Örn: 45', en: 'e.g., 45' },
  proteinLabel: { tr: 'Protein (gr)', en: 'Protein (g)' },
  fatLabel: { tr: 'Yağ (gr)', en: 'Fat (g)' },
  optionalPlaceholder: { tr: 'Opsiyonel', en: 'Optional' },
  expertAlertTitle: { tr: 'UZMAN ÖNERİSİ UYARISI', en: 'EXPERT ADVICE ALERT' },
  tagSelectionLabel: { tr: 'Etiket Seçimi', en: 'Select Tag' },
  tagFasting: { tr: 'Açlık', en: 'Fasting' },
  tagPostMeal: { tr: 'Tokluk', en: 'Post-meal' },
  tagExercise: { tr: 'Egzersiz', en: 'Exercise' },
  tagNormal: { tr: 'Normal', en: 'Normal' },
  exerciseModeLabel: { tr: 'Egzersiz Modu', en: 'Exercise Mode' },
  exerciseBannerText: { 
    tr: 'Klinik Bilgi: Egzersiz modu aktif. Geç hipoglisemiyi önlemek için doz %20 azaltıldı.', 
    en: 'Clinical Insight: Exercise mode active. Dose reduced by 20% to prevent delayed hypoglycemia.' 
  },
  calcButtonText: { tr: 'Klinik Hesaplamayı Başlat', en: 'Start Clinical Calculation' },
  recommendedDoseLabel: { tr: 'ÖNERİLEN İNSÜLİN DOZU', en: 'RECOMMENDED INSULIN DOSE' },
  unitText: { tr: 'Ünite', en: 'Units' },
  saveToLogBtn: { tr: 'Günlüğe Kaydet', en: 'Save to Diary' },
  pleaseEnterBg: { tr: 'Lütfen kan şekeri girin', en: 'Please enter blood glucose' },
  errInvalidBg: { tr: 'Geçerli bir kan şekeri girmeniz gereklidir.', en: 'Valid blood glucose entry required.' },
  mealLogPost: { tr: 'Öğün Kaydı (Tokluk)', en: 'Meal Entry (Post-meal)' },
  mealLogNormal: { tr: 'Öğün Kaydı', en: 'Meal Entry' },

  // Settings Screen
  settingsTitle: { tr: 'Klinik Ayarlar', en: 'Clinical Settings' },
  paramConfigSection: { tr: 'Parametre Konfigürasyonu', en: 'Parameter Configuration' },
  paramDesc: { 
    tr: 'İnsülin hesaplamalarınızın klinik doğrulukla yapılabilmesi için lütfen güncel duyarlılık ve oran parametrelerinizi tanımlayın.', 
    en: 'Please define your active insulin sensitivity and carbohydrate ratio parameters to guarantee precise clinical dosing calculations.' 
  },
  crLabel: { tr: 'Karbonhidrat Oranı (CR)', en: 'Carb-to-Insulin Ratio (CR)' },
  crHint: { tr: '1 Ünite insülinin kaç gram karbonhidratı karşıladığı (Örn: 10)', en: 'Grams of carbs covered by 1 Unit of insulin (e.g., 10)' },
  isfLabel: { tr: 'İnsülin Duyarlılık Faktörü (ISF)', en: 'Insulin Sensitivity Factor (ISF)' },
  isfHint: { tr: '1 Ünite insülinin kan şekerini kaç mg/dL düşürdüğü (Örn: 50)', en: 'Blood glucose drop in mg/dL per 1 Unit of insulin (e.g., 50)' },
  saveParamsBtn: { tr: 'Parametreleri Kaydet', en: 'Save Parameters' },
  settingsSavedAlert: { tr: 'Ayarlarınız kaydedildi.', en: 'Settings saved successfully.' },
  successTitle: { tr: 'Başarılı', en: 'Success' },
  errTitle: { tr: 'Hata', en: 'Error' },
  errInvalidCR: { tr: 'Lütfen geçerli bir Karbonhidrat Oranı girin.', en: 'Please enter a valid Carbohydrate Ratio.' },
  errInvalidISF: { tr: 'Lütfen geçerli bir İnsülin Duyarlılık Faktörü girin.', en: 'Please enter a valid Insulin Sensitivity Factor.' },
  okBtn: { tr: 'Tamam', en: 'OK' },

  // Language Config Section
  languageConfigSection: { tr: 'Dil Seçimi / Language', en: 'Language / Dil Seçimi' },
  languageDesc: { tr: 'Uygulama arayüzünün dilini anında değiştirebilirsiniz.', en: 'Select your preferred application user interface language.' },
  langTrBtn: { tr: 'Türkçe (TR)', en: 'Turkish (TR)' },
  langEnBtn: { tr: 'English (EN)', en: 'English (EN)' },

  // Meal Planner Core
  addNewFoodSection: { tr: 'Özel Yiyecek Oluştur', en: 'Create Custom Food' },
  foodNameInputLabel: { tr: 'Besin Adı', en: 'Food Name' },
  foodNamePlaceholder: { tr: 'Örn: Muz', en: 'e.g., Banana' },
  doseInputLabel: { tr: 'Doz (Ünite)', en: 'Dose (Units)' },
  addBtn: { tr: 'Ekle', en: 'Add' },
  databaseSection: { tr: 'Besin Arama', en: 'Search Food' },
  searchPlaceholder: { tr: 'Besin ara...', en: 'Search food...' },
  selectedMealSection: { tr: 'Seçili Öğün', en: 'Selected Meal' },
  emptyMealText: { tr: 'Henüz besin eklenmedi.', en: 'No food items added yet.' },
  totalCarbsLabel: { tr: 'Toplam Karbonhidrat:', en: 'Total Carbohydrates:' },
  estDoseLabel: { tr: 'Tahmini Doz:', en: 'Estimated Dose:' },
  errInvalidFoodFields: { 
    tr: 'Lütfen geçerli besin adı, karbonhidrat ve doz miktarı girin.', 
    en: 'Please enter valid food name, carbs, and base dose.' 
  },
  foodAddedSuccess: { tr: 'Besin başarıyla eklendi!', en: 'Food item added successfully!' },
  mealPlannerScreenTitle: { tr: 'Besin Veritabanı & Öğün Planlayıcı', en: 'Food DB & Meal Planner' },

  // Pattern Logic (AI output)
  aiFallbackEmpty: { 
    tr: '💡 Yapay Zeka Hazır: Günlük ölçümlerinizi ekleyerek kalıp analizlerini başlatın.', 
    en: '💡 AI Engine Ready: Continue logging daily readings to unlock pattern forecasts.' 
  },
  aiAfternoonHyper: { 
    tr: '⚠️ Öğleden Sonra Yükseliş: İnsülin dozunuzu dikkatli hesaplayın.', 
    en: '⚠️ Afternoon Rise: Bolus boluses should be adjusted for post-lunch loading.' 
  },
  aiAfternoonHypo: { 
    tr: '📉 Öğleden Sonra Düşüş: Ara öğün almayı ihmal etmeyin.', 
    en: '📉 Afternoon Drop: Complex carbs are strongly recommended mid-day.' 
  },
  aiMorningHyper: { 
    tr: '⚠️ Sabah Yüksekliği: Bazal insülin zamanlamanızı gözden geçirin.', 
    en: '⚠️ Fasting Elevation: Consult clinician on evening basal insulin kinetics.' 
  },
  aiMorningHypo: { 
    tr: '📉 Sabah Hipoglisemisi: Gece bazal dozunu doktorunuzla danışın.', 
    en: '📉 Morning Hypo: Nocturnal basal levels may require downward adjustment.' 
  },
  aiEveningHyper: { 
    tr: '⚠️ Akşam Ani Artış: Akşam yemeği karbonhidrat sayımına dikkat edin.', 
    en: '⚠️ Evening Spikes: Review exact dinner macronutrient ratios carefully.' 
  },
  aiEveningHypo: { 
    tr: '📉 Akşam Düşüş Trendi: Egzersiz sonrası karbonhidrat alımını dengeleyin.', 
    en: '📉 Evening Drop: Ensure sufficient pre-bed complex carb refuel occurs.' 
  },
  aiStable: { 
    tr: '✨ Harika Stabilite: Tüm zaman dilimlerinde glisemik dalgalanma minimumda.', 
    en: '✨ Superb Stability: Minimal glycemic variability across all baseline blocks.' 
  },
  blockMorning: { tr: 'Sabah', en: 'Morning' },
  blockAfternoon: { tr: 'Öğle', en: 'Afternoon' },
  blockEvening: { tr: 'Akşam', en: 'Evening' },
  blockGeneral: { tr: 'Genel', en: 'General' },

  // Expert Advice output
  expertAdviceOutput: {
    tr: 'Klinik Öneri: Yüksek yağ/protein algılandı. Gecikmeli yükselişleri önlemek için dozunuzu bölmeyi düşünün: %60 şimdi, %40 2 saat sonra.',
    en: 'Clinical Insight: High fat/protein load detected. Consider splitting your dose: 60% immediate bolus, 40% extended over 2 hours.'
  },
  
  // Table / Grid Headers
  colDate: { tr: 'Tarih', en: 'Date' },
  colTime: { tr: 'Saat', en: 'Time' },
  colCarbs: { tr: 'Karbo', en: 'Carbs' },
  colTrend: { tr: 'Eğilim', en: 'Trend' }
};

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  if (!translations[key]) return key;
  return translations[key][lang] || translations[key].en;
}
