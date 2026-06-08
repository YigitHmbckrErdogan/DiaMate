import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/config/firebaseConfig';

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/invalid-email': return 'Geçersiz e-posta formatı. Lütfen geçerli bir e-posta adresi yazın (örn: yigit@gmail.com).';
      case 'auth/user-not-found': return 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.';
      case 'auth/wrong-password': return 'Hatalı şifre girdiniz.';
      case 'auth/invalid-credential': return 'E-posta veya şifre hatalı.';
      case 'auth/email-already-in-use': return 'Bu e-posta adresi zaten kullanımda. Lütfen giriş yapmayı deneyin.';
      case 'auth/weak-password': return 'Şifreniz çok zayıf. Lütfen en az 6 karakterli bir şifre belirleyin.';
      case 'auth/operation-not-allowed': return 'HATA: Firebase Panelinde "Email/Password" yöntemi aktif edilmemiş!';
      default: return 'Bir hata oluştu: ' + code;
    }
  };

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log('Google Auth Success:', result.user.email);
        navigation.replace('Dashboard');
      } catch (error) {
        console.error('Google Auth Error:', error);
        alert('Giriş başarısız oldu. Lütfen tekrar deneyin.');
      }
    } else {
      alert('Google ile giriş mobilde (Expo Go) desteklenmiyor. Lütfen e-posta ile giriş yapın.');
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      alert('Lütfen e-posta ve şifre girin.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Dashboard');
    } catch (error: any) {
      console.error('Email Login Error:', error);
      alert('Giriş başarısız: ' + getErrorMessage(error.code));
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password) {
      alert('Lütfen e-posta ve şifre girin.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Dashboard');
    } catch (error: any) {
      console.error('Email Register Error:', error);
      alert('Kayıt başarısız: ' + getErrorMessage(error.code));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Glassmorphism Card */}
        <View style={styles.glassCard}>
          <View style={styles.headerContainer}>
            <Ionicons name="medical" size={48} color="#4ade80" style={styles.logoIcon} />
            <Text style={styles.title}>DiaMate</Text>
            <Text style={styles.subtitle}>Clinical Diabetes Management</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.emailButtonContainer}>
            <TouchableOpacity style={styles.emailButton} onPress={handleEmailSignIn}>
              <Text style={styles.buttonText}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.emailButton, styles.registerButton]} onPress={handleEmailRegister}>
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'web' && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>VEYA</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.googleButton} 
                activeOpacity={0.8}
                onPress={handleGoogleSignIn}
              >
                <Ionicons name="logo-google" size={24} color="#ffffff" style={styles.googleIcon} />
                <Text style={styles.buttonText}>Google (Sadece Web)</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1128', // Deep Space Navy
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    }),
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  input: {
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  emailButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginBottom: 24,
  },
  emailButton: {
    flex: 1,
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2DD4BF',
  },
  registerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: '#94a3b8',
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
