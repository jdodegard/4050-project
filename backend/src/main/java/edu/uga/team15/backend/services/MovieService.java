package edu.uga.team15.backend.services;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import edu.uga.team15.backend.models.Movie;
import java.util.List;
import java.util.ArrayList;
import java.sql.*;

@Service
public class MovieService {

    private final DataSource dataSource;

    @Autowired
    public MovieService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Gives list of all movies that are coming soon
     */
    public List<Movie> getComingSoon() {
        String sql = """
                SELECT *
                FROM Movies
                WHERE showing_status = 'Coming Soon'
                """;
        List<Movie> comin = new ArrayList<>();
        
         try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

                try (ResultSet rs = pstmt.executeQuery()) {
                    while (rs.next()) {
                        comin.add(new Movie(rs.getInt("movie_id"), 
                        rs.getString("title"), 
                        rs.getString("rating"), 
                        rs.getString("description"), 
                        rs.getString("poster_url"), 
                        rs.getString("trailer_url"), 
                        rs.getString("genre"), 
                        rs.getString("showing_status")));
                    }
                }

             } catch (SQLException e) {
                throw new RuntimeException("Failed to get movies coming soon", e);
             }
        return comin;
    }//getComingSoon()

    /**
     * Gives list of all movies that are coming soon
     */
    public List<Movie> getCurrentlyRunning() {
        String sql = """
                SELECT *
                FROM Movies
                WHERE showing_status = 'Currently Running'
                """;
        
        List<Movie> playin = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

                try (ResultSet rs = pstmt.executeQuery()) {
                    while (rs.next()) {
                        playin.add(new Movie(rs.getInt("movie_id"), 
                        rs.getString("title"), 
                        rs.getString("rating"), 
                        rs.getString("description"), 
                        rs.getString("poster_url"), 
                        rs.getString("trailer_url"), 
                        rs.getString("genre"), 
                        rs.getString("showing_status")));
                    }
                }

             } catch (SQLException e) {
                throw new RuntimeException("Failed to get movies coming soon", e);
             }
        return playin;
    }//getComingSoon()
}