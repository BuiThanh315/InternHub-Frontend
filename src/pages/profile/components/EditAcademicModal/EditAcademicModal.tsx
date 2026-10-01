import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button, Input } from '../../../../components/common';
import { profileService } from '../../../../services/profileService';
import { InternAcademicSchema, type InternAcademicFormData } from '../../../../types';
import type { EditAcademicModalProps } from './EditAcademicModal.types';
import styles from './EditAcademicModal.module.css';

export const EditAcademicModal: React.FC<EditAcademicModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InternAcademicFormData>({
    resolver: zodResolver(InternAcademicSchema),
    defaultValues: {
      university: '',
      major: '',
      academicYear: '',
      gpa: null,
      skills: [],
      linkedinUrl: '',
      githubUrl: '',
    },
  });

  useEffect(() => {
    if (profile && isOpen) {
      const initialSkills = (profile as any)?.skills || [];
      setSkills(initialSkills);
      reset({
        university: profile.university || '',
        major: profile.major || '',
        academicYear: profile.academicYear || '',
        gpa: profile.gpa ?? null,
        skills: initialSkills,
        linkedinUrl: (profile as any)?.linkedinUrl || '',
        githubUrl: (profile as any)?.githubUrl || '',
      });
    }
  }, [profile, isOpen, reset]);

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast.warning('Kỹ năng này đã tồn tại trong danh sách.');
      return;
    }
    const nextSkills = [...skills, trimmed];
    setSkills(nextSkills);
    setValue('skills', nextSkills);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const nextSkills = skills.filter((s) => s !== skillToRemove);
    setSkills(nextSkills);
    setValue('skills', nextSkills);
  };

  const onSubmit = async (data: InternAcademicFormData) => {
    try {
      setIsSubmitting(true);
      const updated = await profileService.updateInternAcademic({
        university: data.university.trim(),
        major: data.major.trim(),
        academicYear: data.academicYear.trim(),
        gpa: data.gpa,
        skills: skills,
        linkedinUrl: data.linkedinUrl?.trim() || undefined,
        githubUrl: data.githubUrl?.trim() || undefined,
      });

      onSuccess(updated);
      toast.success('Cập nhật học vấn & kỹ năng thành công!');
      onClose();
    } catch (err: unknown) {
      console.error('Lỗi cập nhật học vấn:', err);
      const msg = err instanceof Error ? err.message : 'Cập nhật học vấn thất bại.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập Nhật Học Vấn & Năng Lực Kỹ Thuật"
      size="lg"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy Bỏ
          </Button>
          <Button
            type="submit"
            form="edit-academic-form"
            variant="primary"
            isLoading={isSubmitting}
          >
            Lưu Học Vấn
          </Button>
        </div>
      }
    >
      <form id="edit-academic-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.formGrid}>
          {/* Trường Đại học */}
          <Input
            label="Trường ĐH / CĐ *"
            placeholder="Ví dụ: Đại học Bách Khoa Hà Nội"
            {...register('university')}
            error={errors.university?.message}
          />

          {/* Chuyên ngành */}
          <Input
            label="Chuyên ngành đào tạo *"
            placeholder="Ví dụ: Công nghệ thông tin"
            {...register('major')}
            error={errors.major?.message}
          />

          {/* Niên khóa (Regex YYYY - YYYY) */}
          <Input
            label="Niên khóa đào tạo *"
            placeholder="Định dạng: 2022 - 2026"
            {...register('academicYear')}
            error={errors.academicYear?.message}
          />

          {/* Điểm GPA */}
          <Input
            label="Điểm trung bình (GPA hệ 4)"
            type="number"
            step="0.01"
            placeholder="Ví dụ: 3.52"
            {...register('gpa', {
              setValueAs: (v) => (v === '' || v === null ? null : parseFloat(v)),
            })}
            error={errors.gpa?.message}
          />

          {/* Quản lý Thẻ kỹ năng */}
          <div className={styles.fullWidth}>
            <label className="form-label">Thẻ kỹ năng & Công nghệ chuyên môn</label>
            <div className={styles.tagInputGroup}>
              <Input
                placeholder="Nhập tên kỹ năng (VD: React, Spring Boot, Docker...)"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddSkill}
                leftIcon={<Plus size={15} />}
              >
                Thêm
              </Button>
            </div>

            <div className={styles.tagsContainer}>
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <span key={index} className={styles.tagItem}>
                    <span>{skill}</span>
                    <button
                      type="button"
                      className={styles.removeTagBtn}
                      onClick={() => handleRemoveSkill(skill)}
                      title={`Xóa ${skill}`}
                      aria-label={`Xóa thẻ kỹ năng ${skill}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Chưa có thẻ kỹ năng nào được thêm.
                </span>
              )}
            </div>
          </div>

          {/* LinkedIn Profile */}
          <Input
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/username"
            {...register('linkedinUrl')}
            error={errors.linkedinUrl?.message}
          />

          {/* GitHub Repository */}
          <Input
            label="GitHub URL"
            placeholder="https://github.com/username"
            {...register('githubUrl')}
            error={errors.githubUrl?.message}
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditAcademicModal;
