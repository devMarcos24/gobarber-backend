import { startOfHour } from 'date-fns';
import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Apointment from '../models/Appointment';
import User from '../models/User';
import AppointmentsRepository from '../repositories/AppointmentsRepository';

interface Request {
  provider_id: string;
  date: Date;
}

class CreateAppointmentService {
  public async execute({ provider_id, date }: Request): Promise<Apointment> {
    const appointmentsRepository = getCustomRepository(AppointmentsRepository);
    const userRespository = getRepository(User);
    const appointmentDate = startOfHour(date);

    const checkProviderExists = await userRespository.findOne({
      where: { id: provider_id },
    });

    if (!checkProviderExists) {
      throw new AppError('Provider id not found');
    }

    const findAppointmentInSameDate = await appointmentsRepository.findByDate(
      appointmentDate
    );

    if (findAppointmentInSameDate) {
      throw new AppError('This appointment is already booked');
    }

    const appointment = appointmentsRepository.create({
      provider_id,
      date: appointmentDate,
    });

    await appointmentsRepository.save(appointment);

    return appointment;
  }
}

export default CreateAppointmentService;
