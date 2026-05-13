import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSignIn, useSignUp, useOAuth, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  
  const { startOAuthFlow: startMicrosoftAuth } = useOAuth({ strategy: 'oauth_microsoft' });

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  React.useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      router.replace('/');
    }
  }, [isAuthLoaded, isSignedIn, router]);

  const onSignInPress = async () => {
    if (isSignedIn) {
      router.replace('/');
      return;
    }
    if (!isSignInLoaded) return;
    setIsLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      console.error('Sign in error:', err);
      const errorMessage = err?.errors?.[0]?.message || err?.message || 'Error al iniciar sesión';
      Alert.alert('Error al ingresar', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUpPress = async () => {
    if (isSignedIn) {
      router.replace('/');
      return;
    }
    if (!isSignUpLoaded) return;
    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ')
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      const errorMessage = err?.errors?.[0]?.message || err?.message || 'Error al registrarse';
      Alert.alert('Error de registro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (isSignedIn) {
      router.replace('/');
      return;
    }
    if (!isSignUpLoaded) return;
    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      await setSignUpActive({ session: completeSignUp.createdSessionId });
    } catch (err: any) {
      console.error('Verification error:', err);
      const errorMessage = err?.errors?.[0]?.message || err?.message || 'Código inválido';
      Alert.alert('Código Inválido', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onMicrosoftPress = async () => {
    if (isSignedIn) {
      router.replace('/');
      return;
    }
    setIsLoading(true);
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startMicrosoftAuth({
        redirectUrl: Linking.createURL('/'),
      });
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('Microsoft auth error:', err);
      Alert.alert('Autenticación cancelada o fallida');
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 bg-slate-900 justify-center px-8">
        <Text className="text-3xl font-bold text-white mb-2">Verifica tu Correo</Text>
        <Text className="text-slate-400 mb-6">Hemos enviado un código de acceso a {emailAddress}</Text>
        <TextInput
          className="bg-slate-800/80 rounded-2xl px-5 py-4 text-white text-lg border border-slate-700 text-center tracking-widest mb-4"
          placeholder="Código de 6 dígitos"
          placeholderTextColor="#64748b"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        <TouchableOpacity
          onPress={onPressVerify}
          disabled={isLoading}
          className="bg-sky-500 rounded-2xl py-4 items-center mb-4"
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-bold">Completar Registro</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPendingVerification(false)}>
          <Text className="text-sky-400 text-center">Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      <View className="flex-1 justify-center px-8 relative">
        <View className="absolute top-[-50] left-[-50] w-64 h-64 bg-sky-600 rounded-full opacity-20 blur-3xl"></View>

        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-sky-500 rounded-3xl items-center justify-center mb-4 shadow-lg shadow-sky-500/50">
            <Text className="text-3xl">🔐</Text>
          </View>
          <Text className="text-3xl font-bold text-white tracking-tight">Key Alumnos</Text>
          <Text className="text-slate-400 text-base">{isRegistering ? 'Crea una cuenta nueva' : 'Bienvenido de vuelta'}</Text>
        </View>

        <View className="space-y-4">
          {isRegistering && (
            <View>
              <Text className="text-slate-300 font-medium mb-1 ml-1 text-sm">Nombre Completo</Text>
              <TextInput
                className="bg-slate-800/80 rounded-xl px-4 py-3 text-white border border-slate-700"
                placeholder="ej. Diego Gómez"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View>
            <Text className="text-slate-300 font-medium mb-1 ml-1 text-sm">Correo Electrónico</Text>
            <TextInput
              className="bg-slate-800/80 rounded-xl px-4 py-3 text-white border border-slate-700"
              autoCapitalize="none"
              placeholder="alumno@universidad.edu"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />
          </View>

          <View>
            <Text className="text-slate-300 font-medium mb-1 ml-1 text-sm">Contraseña</Text>
            <TextInput
              className="bg-slate-800/80 rounded-xl px-4 py-3 text-white border border-slate-700"
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            onPress={isRegistering ? onSignUpPress : onSignInPress}
            disabled={isLoading}
            className="bg-sky-500 rounded-xl py-3.5 mt-4 items-center active:scale-95 duration-200"
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-bold">{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</Text>}
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-slate-700"></View>
          <Text className="text-slate-500 px-4 text-sm">o continuar con</Text>
          <View className="flex-1 h-[1px] bg-slate-700"></View>
        </View>

        <TouchableOpacity
          onPress={onMicrosoftPress}
          disabled={isLoading}
          className="bg-slate-800 flex-row items-center justify-center rounded-xl py-3.5 border border-slate-700 active:bg-slate-700 duration-200"
        >
          <Ionicons name="logo-windows" size={20} color="#38bdf8" className="mr-2" />
          <Text className="text-slate-200 text-base font-medium ml-2">Microsoft</Text>
        </TouchableOpacity>

        <View className="mt-8 flex-row justify-center">
          <Text className="text-slate-400">
            {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
          </Text>
          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
            <Text className="text-sky-400 font-bold ml-2">
              {isRegistering ? 'Inicia sesión' : 'Regístrate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
