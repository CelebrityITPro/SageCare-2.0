import { useMutation, useQuery } from "@tanstack/react-query";

const AI_DIAGNOSIS_BASE_URL = import.meta.env.VITE_AI_DIAGNOSIS_API_URL || 'http://localhost:5002';
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface SymptomAnalysisRequest {
  symptoms: string;
  patient_info: {
    age?: number;
    gender?: string;
    medical_history?: string;
    current_medications?: string[];
    allergies?: string[];
  };
}

export interface SymptomAnalysisResponse {
  diagnosis: {
    preliminary_diagnosis: string;
    confidence: number;
    possible_conditions: string[];
    urgency_level: "low" | "medium" | "high" | "emergency";
    disclaimer: string;
  };
  recommendations: {
    primary_specialty: string;
    secondary_specialties: string[];
    immediate_actions: string[];
    general_advice: string;
    follow_up_timeline: string;
  };
  analysis_metadata: {
    model_used: string;
    processing_time: number;
    confidence_factors: string[];
  };
}

export interface DiagnosisHistory {
  _id: string;
  patient: string;
  symptoms: {
    description: string;
    severity: "mild" | "moderate" | "severe";
    duration?: string;
    onset?: string;
    triggers?: string[];
    associatedSymptoms?: string[];
  };
  patientContext: {
    age?: number;
    gender?: string;
    medicalHistory?: string;
    currentMedications?: string[];
    allergies?: string[];
    lifestyleFactors?: string[];
  };
  aiDiagnosis: {
    preliminaryDiagnosis: string;
    confidence: number;
    possibleConditions: string[];
    urgencyLevel: "low" | "medium" | "high" | "emergency";
    aiModel: string;
    processingTime: number;
    modelVersion: string;
  };
  recommendations: {
    primarySpecialty: string;
    secondarySpecialties: string[];
    immediateActions: string[];
    generalAdvice: string;
    followUpTimeline: string;
    selfCareInstructions?: string[];
  };
  recommendedDoctors: Array<{
    doctor?: {
      _id: string;
      first_name: string;
      last_name: string;
      specialty: string;
    };
    specialty: string;
    reason: string;
    availability: string;
  }>;
  userActions: {
    bookedAppointment: boolean;
    appointmentId?: string;
    consultedDoctor: boolean;
    doctorFeedback?: string;
    symptomsResolved?: boolean;
    resolutionDate?: string;
  };
  userFeedback?: {
    diagnosisAccuracy: number;
    recommendationHelpfulness: number;
    overallSatisfaction: number;
    comments?: string;
    wouldRecommend?: boolean;
  };
  status: "active" | "resolved" | "follow_up_needed" | "archived";
  createdAt: string;
  updatedAt: string;
}

/**
 * Analyze symptoms using the AI diagnosis service
 */
export const useAnalyzeSymptoms = () => {
  return useMutation({
    mutationFn: async (data: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> => {
      const response = await fetch(`${AI_DIAGNOSIS_BASE_URL}/analyze-symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    },
  });
};

/**
 * Get available medical specialties
 */
export const useGetAvailableSpecialties = () => {
  return useQuery({
    queryKey: ["availableSpecialties"],
    queryFn: async () => {
      const response = await fetch(`${AI_DIAGNOSIS_BASE_URL}/available-specialties`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.specialties;
    },
  });
};

/**
 * Get diagnosis history for a patient
 */
export const useGetDiagnosisHistory = (patientId: string, options?: {
  page?: number;
  limit?: number;
  status?: string;
  specialty?: string;
}) => {
  return useQuery({
    queryKey: ["diagnosisHistory", patientId, options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.page) params.append("page", options.page.toString());
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.status) params.append("status", options.status);
      if (options?.specialty) params.append("specialty", options.specialty);

      const response = await fetch(
        `${API_BASE_URL}/diagnosis-history/patient/${patientId}?${params}`,
        {
          headers: {
            token: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch diagnosis history");
      }

      return response.json();
    },
    enabled: !!patientId,
  });
};

/**
 * Get specific diagnosis entry
 */
export const useGetDiagnosis = (diagnosisId: string) => {
  return useQuery({
    queryKey: ["diagnosis", diagnosisId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/diagnosis-history/${diagnosisId}`, {
        headers: {
          token: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch diagnosis");
      }

      return response.json();
    },
    enabled: !!diagnosisId,
  });
};

/**
 * Create new diagnosis entry
 */
export const useCreateDiagnosis = () => {
  return useMutation({
    mutationFn: async (diagnosisData: any) => {
      const response = await fetch(`${API_BASE_URL}/diagnosis-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(diagnosisData),
      });

      if (!response.ok) {
        throw new Error("Failed to create diagnosis entry");
      }

      return response.json();
    },
  });
};

/**
 * Update diagnosis entry
 */
export const useUpdateDiagnosis = () => {
  return useMutation({
    mutationFn: async ({ diagnosisId, data }: { diagnosisId: string; data: any }) => {
      const response = await fetch(`${API_BASE_URL}/diagnosis-history/${diagnosisId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update diagnosis");
      }

      return response.json();
    },
  });
};

/**
 * Get diagnosis statistics
 */
export const useGetDiagnosisStats = (patientId: string) => {
  return useQuery({
    queryKey: ["diagnosisStats", patientId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/diagnosis-history/stats/${patientId}`, {
        headers: {
          token: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch diagnosis statistics");
      }

      return response.json();
    },
    enabled: !!patientId,
  });
};

/**
 * Get doctors by specialty
 */
export const useGetDoctorsBySpecialty = (specialty: string, limit: number = 5) => {
  return useQuery({
    queryKey: ["doctorsBySpecialty", specialty, limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/diagnosis-history/doctors/specialty/${specialty}?limit=${limit}`,
        {
          headers: {
            token: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      return response.json();
    },
    enabled: !!specialty,
  });
};

/**
 * Submit feedback on diagnosis
 */
export const useSubmitDiagnosisFeedback = () => {
  return useMutation({
    mutationFn: async ({ 
      diagnosisId, 
      feedback 
    }: { 
      diagnosisId: string; 
      feedback: {
        diagnosisAccuracy: number;
        recommendationHelpfulness: number;
        overallSatisfaction: number;
        comments?: string;
        wouldRecommend?: boolean;
      };
    }) => {
      const response = await fetch(`${API_BASE_URL}/diagnosis-history/${diagnosisId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      return response.json();
    },
  });
};

/**
 * Mark diagnosis as resolved
 */
export const useResolveDiagnosis = () => {
  return useMutation({
    mutationFn: async ({ 
      diagnosisId, 
      data 
    }: { 
      diagnosisId: string; 
      data: {
        symptomsResolved: boolean;
        resolutionDate?: string;
      };
    }) => {
      const response = await fetch(`${API_BASE_URL}/diagnosis-history/${diagnosisId}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to resolve diagnosis");
      }

      return response.json();
    },
  });
};

/**
 * Check AI diagnosis service health
 */
export const useCheckAIServiceHealth = () => {
  return useQuery({
    queryKey: ["aiServiceHealth"],
    queryFn: async () => {
      const response = await fetch(`${AI_DIAGNOSIS_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`AI service health check failed: ${response.status}`);
      }

      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });
}; 