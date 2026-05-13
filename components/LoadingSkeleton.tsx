import React from 'react';
import { View } from 'react-native';

export default function LoadingSkeleton() {
  return (
    <View className="flex-1 bg-slate-900 px-4 pt-4">
      <View className="h-8 w-48 bg-slate-700 rounded-lg mb-6" />

      {[1, 2, 3].map((i) => (
        <View key={i} className="bg-slate-800 rounded-2xl p-5 mb-4 border border-slate-700/50">
          <View className="flex-row justify-between items-end mb-4">
            <View className="flex-1 mr-4">
              <View className="h-6 w-32 bg-slate-700 rounded-lg mb-2" />
              <View className="h-4 w-24 bg-slate-700 rounded" />
            </View>
            <View className="h-8 w-20 bg-slate-700 rounded-full" />
          </View>

          <View className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <View className="h-full w-1/2 bg-slate-600" />
          </View>
        </View>
      ))}
    </View>
  );
}
