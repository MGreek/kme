package com.example.kmebackend.repository

import com.example.kmebackend.model.Grouping
import com.example.kmebackend.model.Voice
import com.example.kmebackend.model.VoiceId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface VoiceRepository : JpaRepository<Voice, VoiceId> {
    /**
     * @return the number of groupings which are children of the given Voice
     */
    @Query("SELECT COUNT(g) FROM Grouping g WHERE g.groupingId.voiceId = ?1")
    fun countChildren(voiceId: VoiceId): Int

    /**
     * @return the groupings which are children of the given Voice
     */
    @Query("SELECT g FROM Grouping g WHERE g.groupingId.voiceId = ?1 ORDER BY g.groupingId.groupingsOrder")
    fun getChildren(voiceId: VoiceId): List<Grouping>
}