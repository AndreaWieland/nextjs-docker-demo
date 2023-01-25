import { NextApiResponse, NextApiRequest } from 'next'
import { people } from '../../../data/data'
import { Person } from '../../../interfaces'

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Person[]>
) {
  return res.status(200).json(people)
}
