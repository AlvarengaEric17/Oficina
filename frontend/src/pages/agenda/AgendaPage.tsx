import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { scheduleService } from '../../services/scheduleService';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import type { Schedule } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuthStore } from '../../store/authStore';

export const AgendaPage: React.FC = () => {
  const { user } = useAuthStore();
  const [slots, setSlots] = useState<Schedule[]>([]);
  const [publicSlots, setPublicSlots] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { isConnected, onScheduleUpdated } = useWebSocket();

  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    loadSchedule();
  }, []);

  useEffect(() => {
    const handleScheduleUpdate = (data: any) => {
      toast.info('Agenda atualizada em tempo real!');
      if (data.type === 'SLOT_CREATED') {
        loadSchedule();
      }
    };

    if (isConnected) {
      onScheduleUpdated(handleScheduleUpdate);
    }
  }, [isConnected]);

  const loadSchedule = async () => {
    try {
      if (user?.role === 'MECHANIC') {
        const mechanicSlots = await scheduleService.getMechanicSchedule();
        setSlots(mechanicSlots);
      }
      
      const pubSlots = await scheduleService.getPublicSchedule();
      setPublicSlots(pubSlots);
    } catch (error) {
      toast.error('Erro ao carregar agenda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.start_time || !formData.end_time) {
      toast.error('Preencha data e hora de início e término');
      return;
    }

    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      await scheduleService.createSlot({
        mechanic_id: user.id,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      });
      toast.success('Horário adicionado com sucesso!');
      setFormData({ start_time: '', end_time: '' });
      setShowForm(false);
      loadSchedule();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar horário');
    }
  };

  const handleToggleAvailability = async (slotId: string, isAvailable: boolean) => {
    try {
      await scheduleService.updateSlotAvailability(slotId, !isAvailable);
      toast.success('Disponibilidade atualizada!');
      loadSchedule();
    } catch (error: any) {
      toast.error('Erro ao atualizar disponibilidade');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    const date = format(new Date(slot.start_time), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, Schedule[]>);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">📅 Agenda de Horários</h1>

        {user?.role === 'MECHANIC' && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Meus Horários Disponíveis</h2>
              <Button variant="primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancelar' : '+ Novo Horário'}
              </Button>
            </div>

            {showForm && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Adicionar Horário Disponível</h3>
                <form onSubmit={handleCreateSlot} className="space-y-4">
                  <Input
                    type="datetime-local"
                    label="Data/Hora de Início"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />

                  <Input
                    type="datetime-local"
                    label="Data/Hora de Término"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />

                  <Button type="submit" variant="success" className="w-full">
                    Adicionar Horário
                  </Button>
                </form>
              </Card>
            )}

            {isLoading ? (
              <Card>
                <p className="text-center">Carregando agenda...</p>
              </Card>
            ) : Object.keys(groupedSlots).length === 0 ? (
              <Card>
                <p className="text-center text-gray-500">Você ainda não adicionou horários disponíveis</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedSlots).map(([date, daySlots]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">
                      {format(new Date(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {daySlots.map((slot) => (
                        <Card key={slot.id} className={!slot.is_available ? 'opacity-50' : ''}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold">
                                {format(new Date(slot.start_time), 'HH:mm', { locale: ptBR })} - {format(new Date(slot.end_time), 'HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${slot.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {slot.is_available ? 'Disponível' : 'Indisponível'}
                            </span>
                          </div>
                          <Button
                            variant={slot.is_available ? 'danger' : 'success'}
                            size="sm"
                            className="w-full"
                            onClick={() => handleToggleAvailability(slot.id, slot.is_available)}
                          >
                            {slot.is_available ? 'Marcar como Indisponível' : 'Marcar como Disponível'}
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">📊 Painel Público de Horários</h2>
          {isLoading ? (
            <Card>
              <p className="text-center">Carregando horários...</p>
            </Card>
          ) : publicSlots.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500">Nenhum horário disponível no momento</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicSlots.map((slot) => (
                <Card key={slot.id} className="bg-green-50 border-l-4 border-green-500">
                  <p className="font-semibold text-green-700">✅ Disponível</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {slot.mechanic?.name}
                  </p>
                  <p className="text-lg font-bold mt-3">
                    {format(new Date(slot.start_time), 'HH:mm', { locale: ptBR })} - {format(new Date(slot.end_time), 'HH:mm', { locale: ptBR })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(slot.start_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
