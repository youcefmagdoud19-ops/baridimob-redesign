import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { s } from '../styles';
import { BLUE, DEEP, GOLD, GREEN } from '../theme';
import { RIP, RIP_FORMATTED } from '../data';
import { fmt } from '../utils';
import TxItem from '../components/TxItem';

const actions = [
  { icon: 'swap-horizontal', label: 'تحويل', screen: 'transfer' },
  { icon: 'document-text-outline', label: 'كشف الحساب', screen: 'statement' },
  { icon: 'qr-code-outline', label: 'دفع', screen: 'pay' },
  { icon: 'grid-outline', label: 'المزيد', screen: 'more' },
];

export default function Home({ userName, balance, transactions, go, onShowQr }) {
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyRip = async () => {
    await Clipboard.setStringAsync(RIP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
      <LinearGradient
        colors={[DEEP, BLUE, GOLD]}
        locations={[0, 0.65, 1.15]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.header}
      >
        <View style={s.deco1} />
        <View style={s.deco2} />
        <View style={s.deco3} />
        <View style={s.topBar}>
          <View style={s.iconRow}>
            <View style={s.circle}>
              <Ionicons name="person-outline" size={20} color="#fff" />
            </View>
            <TouchableOpacity style={s.circle} onPress={() => go('info')}>
              <Ionicons name="notifications-outline" size={20} color={GOLD} />
            </TouchableOpacity>
            <TouchableOpacity style={s.circleGold} onPress={onShowQr}>
              <Ionicons name="qr-code-outline" size={20} color={DEEP} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={s.greeting}>مرحبا {userName}</Text>
        <Text style={s.sub}>حسابك الجاري CCP</Text>
      </LinearGradient>

      <View style={s.card}>
        <Text style={s.label}>رقم الحساب الجاري (RIP) :</Text>
        <View style={s.accountRow}>
          <Text style={s.account}>{RIP_FORMATTED}</Text>
          <TouchableOpacity onPress={copyRip} style={s.copyBtn}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={18}
              color={copied ? GREEN : BLUE}
            />
            <Text style={[s.copyText, { color: copied ? GREEN : BLUE }]}>
              {copied ? 'تم النسخ' : 'نسخ'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={s.label}>الرصيد المتاح :</Text>
        <LinearGradient
          colors={[DEEP, BLUE]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.balanceBox}
        >
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={24} color={GOLD} />
          </TouchableOpacity>
          <Text style={s.balance}>
            {hidden ? '••••••' : fmt(balance)}
            <Text style={s.currency}> د.ج</Text>
          </Text>
        </LinearGradient>
      </View>

      <View style={s.actions}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.label}
            style={s.action}
            onPress={() => a.screen && go(a.screen)}
          >
            <LinearGradient
              colors={[BLUE, DEEP]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.actionBox}
            >
              <Ionicons name={a.icon} size={26} color={GOLD} />
            </LinearGradient>
            <Text style={s.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>آخر العمليات</Text>
        <TouchableOpacity onPress={() => go('statement')}>
          <Text style={s.link}>عرض الكل</Text>
        </TouchableOpacity>
      </View>
      {transactions.slice(0, 3).map((t) => (
        <TxItem key={t.id} t={t} />
      ))}
    </ScrollView>
  );
}
