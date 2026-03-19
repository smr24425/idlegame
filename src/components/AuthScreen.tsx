import React, { useState } from 'react';
import { Card, Button, Input, Form, Toast } from 'antd-mobile';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Toast.show('請輸入信箱與密碼');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        Toast.show('登入成功！');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        Toast.show('註冊成功！將為您登入系統...');
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        Toast.show('此信箱已被註冊');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        Toast.show('帳號或密碼錯誤');
      } else if (err.code === 'auth/weak-password') {
        Toast.show('密碼過度簡單');
      } else {
        Toast.show('發生錯誤：' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px' }}>
      <h1 style={{ color: '#FFD700', textShadow: '0 0 10px rgba(255,215,0,0.5)', marginBottom: '30px', fontSize: '32px' }}>
        掛機谷
      </h1>

      <Card style={{ width: '100%', maxWidth: '400px', background: 'rgba(0,0,0,0.8)', border: '1px solid #FFD700' }}>
        <h2 style={{ color: '#FFF', textAlign: 'center', marginBottom: '20px' }}>
          {isLogin ? '登入帳號' : '註冊新帳號'}
        </h2>

        <Form layout="horizontal" style={{ '--background-color': 'transparent' } as any}>
          <Form.Item label={<span style={{ color: '#FFF' }}>信箱</span>}>
            <Input
              type="email"
              placeholder="請輸入 Email"
              value={email}
              onChange={val => setEmail(val)}
              style={{ color: '#000', background: '#FFF', padding: '8px', borderRadius: '4px' }}
            />
          </Form.Item>
          <Form.Item label={<span style={{ color: '#FFF' }}>密碼</span>}>
            <Input
              type="password"
              placeholder="請輸入密碼"
              value={password}
              onChange={val => setPassword(val)}
              style={{ color: '#000', background: '#FFF', padding: '8px', borderRadius: '4px' }}
            />
          </Form.Item>
        </Form>

        <Button
          block
          color="warning"
          size="large"
          onClick={handleSubmit}
          loading={loading}
          style={{ marginTop: '20px', fontWeight: 'bold' }}
        >
          {isLogin ? '登入' : '註冊帳號'}
        </Button>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Button fill="none" onClick={() => setIsLogin(!isLogin)} style={{ color: '#00E5FF', fontSize: '14px' }}>
            {isLogin ? '還沒有帳號？點此註冊' : '已經有帳號？點此登入'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
