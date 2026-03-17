import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Film } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, username, password);
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      try {
        const parsed = JSON.parse(message);
        const firstError = Object.values(parsed).flat()[0];
        toast.error(String(firstError));
      } catch {
        toast.error('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="cinema-card w-full max-w-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <Film className="h-8 w-8 text-primary mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground">Cadastre-se para começar a reservar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nome de usuário</Label>
            <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required placeholder="meuusuario" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}
